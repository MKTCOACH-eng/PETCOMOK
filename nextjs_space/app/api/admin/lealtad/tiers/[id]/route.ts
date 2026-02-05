import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.isAdmin === true;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const slug = data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
    
    const tier = await prisma.loyaltyTier.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug,
        minPoints: data.minPoints || 0,
        minSpent: data.minSpent || 0,
        pointsMultiplier: data.pointsMultiplier || 1,
        discountPercent: data.discountPercent || 0,
        freeShipping: data.freeShipping || false,
        prioritySupport: data.prioritySupport || false,
        earlyAccess: data.earlyAccess || false,
        birthdayBonus: data.birthdayBonus || 0,
        color: data.color || '#7baaf7',
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json({ tier });
  } catch (error) {
    console.error('Error updating tier:', error);
    return NextResponse.json({ error: 'Error al actualizar nivel' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si hay cuentas con este nivel
    const accountsCount = await prisma.loyaltyAccount.count({
      where: { tierId: params.id },
    });

    if (accountsCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: ${accountsCount} miembros tienen este nivel` },
        { status: 400 }
      );
    }

    await prisma.loyaltyTier.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tier:', error);
    return NextResponse.json({ error: 'Error al eliminar nivel' }, { status: 500 });
  }
}
