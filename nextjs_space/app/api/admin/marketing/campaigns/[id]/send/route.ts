import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import { sendEmail, emailWrapper } from '@/lib/email';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true }
  });
  return user?.isAdmin === true;
}

// Get subscribers based on segment
async function getSegmentedSubscribers(segment: string, filters?: any) {
  const baseWhere: any = { isActive: true };
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  switch (segment) {
    case 'new':
      baseWhere.createdAt = { gte: thirtyDaysAgo };
      break;
    case 'active':
      baseWhere.lastPurchase = { gte: thirtyDaysAgo };
      break;
    case 'inactive':
      baseWhere.OR = [
        { lastPurchase: { lt: ninetyDaysAgo } },
        { lastPurchase: null }
      ];
      break;
    case 'high_value':
      baseWhere.totalPurchases = { gte: 3 };
      break;
    case 'pet_dog':
      baseWhere.petTypes = { has: 'perro' };
      break;
    case 'pet_cat':
      baseWhere.petTypes = { has: 'gato' };
      break;
    case 'all':
    default:
      break;
  }

  // Apply custom filters if any
  if (filters) {
    if (filters.city) {
      baseWhere.city = filters.city;
    }
    if (filters.minPurchases) {
      baseWhere.totalPurchases = { gte: filters.minPurchases };
    }
    if (filters.tags && filters.tags.length > 0) {
      baseWhere.tags = { hasSome: filters.tags };
    }
  }

  return prisma.subscriber.findMany({
    where: baseWhere,
    select: { email: true, name: true }
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // Get campaign
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Esta campaña ya fue enviada' }, { status: 400 });
    }

    // Update status to sending
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: { status: 'sending' }
    });

    // Get segmented subscribers
    const subscribers = await getSegmentedSubscribers(
      campaign.segment || 'all',
      campaign.segmentFilters as any
    );

    // Update total recipients
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: { totalRecipients: subscribers.length }
    });

    let sentCount = 0;
    let failedCount = 0;

    // Send emails (in batches)
    const BATCH_SIZE = 10;
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async (subscriber) => {
          try {
            // Personalize content
            let personalizedContent = campaign.content
              .replace(/{{nombre}}/gi, subscriber.name || 'Amigo de las mascotas');

            const result = await sendEmail({
              to: subscriber.email,
              subject: campaign.subject,
              body: emailWrapper(personalizedContent),
              notificationId: process.env.NOTIF_ID_EMAIL_DE_BIENVENIDA || ''
            });

            if (result.success) {
              sentCount++;
            } else {
              failedCount++;
            }
          } catch {
            failedCount++;
          }
        })
      );

      // Update progress
      await prisma.emailCampaign.update({
        where: { id: params.id },
        data: { sentCount, failedCount }
      });
    }

    // Mark as sent
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        sentCount,
        failedCount
      }
    });

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length
    });
  } catch (error) {
    console.error('Send campaign error:', error);
    
    // Revert status on error
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: { status: 'draft' }
    }).catch(() => {});

    return NextResponse.json({ error: 'Error al enviar campaña' }, { status: 500 });
  }
}
