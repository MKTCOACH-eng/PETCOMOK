import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  return user?.isAdmin === true;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, discountType, discountValue, minPurchase, maxUses, expiresAt, isActive } = body;

    // Check if another coupon has the same code
    const existing = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        NOT: { id: params.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe otro cupón con este código' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minPurchase: minPurchase || null,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Update coupon error:', error);
    return NextResponse.json({ error: 'Error al actualizar el cupón' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await prisma.coupon.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json({ error: 'Error al eliminar el cupón' }, { status: 500 });
  }
}
