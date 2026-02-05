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

// Get single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
      include: { template: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener campaña' }, { status: 500 });
  }
}

// Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const campaign = await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        name: data.name,
        subject: data.subject,
        preheader: data.preheader,
        content: data.content,
        segment: data.segment,
        segmentFilters: data.segmentFilters,
        status: data.status,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        templateId: data.templateId,
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar campaña' }, { status: 500 });
  }
}

// Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await prisma.emailCampaign.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar campaña' }, { status: 500 });
  }
}
