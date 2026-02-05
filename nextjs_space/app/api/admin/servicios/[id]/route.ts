import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.isAdmin === true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        leads: { orderBy: { createdAt: 'desc' }, take: 50 },
        reviews: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json({ error: 'Error al cargar proveedor' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      isApproved, 
      membershipStatus, 
      featured, 
      isActive,
      rejectionReason,
      membershipEndDate 
    } = body;

    const session = await getServerSession(authOptions);
    const updateData: any = {};

    if (isApproved !== undefined) {
      updateData.isApproved = isApproved;
      if (isApproved) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = session?.user?.email;
        updateData.rejectionReason = null;
      } else if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    }

    if (membershipStatus) {
      updateData.membershipStatus = membershipStatus;
      if (membershipStatus === 'active' && !body.membershipStartDate) {
        updateData.membershipStartDate = new Date();
        // Set end date to 30 days from now
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        updateData.membershipEndDate = endDate;
      }
    }

    if (membershipEndDate) {
      updateData.membershipEndDate = new Date(membershipEndDate);
    }

    if (featured !== undefined) updateData.featured = featured;
    if (isActive !== undefined) updateData.isActive = isActive;

    const provider = await prisma.serviceProvider.update({
      where: { id: params.id },
      data: updateData,
      include: { category: true }
    });

    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await prisma.serviceProvider.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
