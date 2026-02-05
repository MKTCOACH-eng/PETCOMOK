import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true }
  });
  return user?.isAdmin === true;
}

// Get all campaigns
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const campaigns = await prisma.emailCampaign.findMany({
      where,
      include: { template: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json({ error: 'Error al obtener campañas' }, { status: 500 });
  }
}

// Create new campaign
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const campaign = await prisma.emailCampaign.create({
      data: {
        name: data.name || `Campaña ${new Date().toLocaleDateString('es-MX')}`,
        subject: data.subject,
        preheader: data.preheader || null,
        content: data.content,
        segment: data.segment || 'all',
        segmentFilters: data.segmentFilters || null,
        status: data.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        templateId: data.templateId || null,
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json({ error: 'Error al crear campaña' }, { status: 500 });
  }
}
