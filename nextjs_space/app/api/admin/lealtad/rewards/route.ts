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

    const rewards = await prisma.loyaltyReward.findMany({
      orderBy: { pointsCost: 'asc' },
    });

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json({ error: 'Error al obtener recompensas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    const reward = await prisma.loyaltyReward.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        pointsCost: data.pointsCost,
        value: data.value,
        productId: data.productId || null,
        minPurchase: data.minPurchase || null,
        maxDiscount: data.maxDiscount || null,
        validDays: data.validDays || 30,
        maxRedemptions: data.maxRedemptions || null,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
      },
    });

    return NextResponse.json({ reward });
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json({ error: 'Error al crear recompensa' }, { status: 500 });
  }
}
