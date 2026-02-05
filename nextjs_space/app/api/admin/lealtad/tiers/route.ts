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

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const tiers = await prisma.loyaltyTier.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { accounts: true } } },
    });

    return NextResponse.json({ tiers });
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return NextResponse.json({ error: 'Error al obtener niveles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const slug = data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
    
    const tier = await prisma.loyaltyTier.create({
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
    console.error('Error creating tier:', error);
    return NextResponse.json({ error: 'Error al crear nivel' }, { status: 500 });
  }
}
