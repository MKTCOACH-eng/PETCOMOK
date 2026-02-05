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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { isApproved, isVisible } = body;

    const review = await prisma.serviceReview.update({
      where: { id: params.id },
      data: { isApproved, isVisible }
    });

    // Recalcular promedio del proveedor
    if (isApproved) {
      const reviews = await prisma.serviceReview.findMany({
        where: { providerId: review.providerId, isApproved: true }
      });
      const avgRating = reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0;
      
      await prisma.serviceProvider.update({
        where: { id: review.providerId },
        data: { 
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length
        }
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
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

    await prisma.serviceReview.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
