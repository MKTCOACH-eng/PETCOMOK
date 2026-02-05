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

    let settings = await prisma.loyaltySettings.findFirst();
    
    if (!settings) {
      settings = await prisma.loyaltySettings.create({
        data: {
          pointsPerPeso: 1,
          minPurchaseForPoints: 100,
          pointsExpirationDays: 365,
          signupBonus: 100,
          firstPurchaseBonus: 200,
          reviewBonus: 50,
          referralBonus: 300,
          birthdayBonus: 100,
          isActive: true,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching loyalty settings:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    let settings = await prisma.loyaltySettings.findFirst();

    if (settings) {
      settings = await prisma.loyaltySettings.update({
        where: { id: settings.id },
        data: {
          pointsPerPeso: data.pointsPerPeso,
          minPurchaseForPoints: data.minPurchaseForPoints,
          pointsExpirationDays: data.pointsExpirationDays,
          signupBonus: data.signupBonus,
          firstPurchaseBonus: data.firstPurchaseBonus,
          reviewBonus: data.reviewBonus,
          referralBonus: data.referralBonus,
          birthdayBonus: data.birthdayBonus,
          isActive: data.isActive,
        },
      });
    } else {
      settings = await prisma.loyaltySettings.create({ data });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating loyalty settings:', error);
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
