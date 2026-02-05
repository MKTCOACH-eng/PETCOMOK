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

// Get segment statistics
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [all, newSubs, active, inactive, highValue, petDog, petCat] = await Promise.all([
      prisma.subscriber.count({ where: { isActive: true } }),
      prisma.subscriber.count({ where: { isActive: true, createdAt: { gte: thirtyDaysAgo } } }),
      prisma.subscriber.count({ where: { isActive: true, lastPurchase: { gte: thirtyDaysAgo } } }),
      prisma.subscriber.count({
        where: {
          isActive: true,
          OR: [{ lastPurchase: { lt: ninetyDaysAgo } }, { lastPurchase: null }]
        }
      }),
      prisma.subscriber.count({ where: { isActive: true, totalPurchases: { gte: 3 } } }),
      prisma.subscriber.count({ where: { isActive: true, petTypes: { has: 'perro' } } }),
      prisma.subscriber.count({ where: { isActive: true, petTypes: { has: 'gato' } } }),
    ]);

    const segments = [
      { id: 'all', name: 'Todos los suscriptores', count: all, icon: 'users', color: 'blue' },
      { id: 'new', name: 'Nuevos (30 días)', count: newSubs, icon: 'user-plus', color: 'green' },
      { id: 'active', name: 'Clientes activos', count: active, icon: 'shopping-bag', color: 'purple' },
      { id: 'inactive', name: 'Inactivos (+90 días)', count: inactive, icon: 'user-x', color: 'orange' },
      { id: 'high_value', name: 'Alto valor (3+ compras)', count: highValue, icon: 'star', color: 'amber' },
      { id: 'pet_dog', name: 'Dueños de perros', count: petDog, icon: 'dog', color: 'cyan' },
      { id: 'pet_cat', name: 'Dueños de gatos', count: petCat, icon: 'cat', color: 'pink' },
    ];

    return NextResponse.json(segments);
  } catch (error) {
    console.error('Get segments error:', error);
    return NextResponse.json({ error: 'Error al obtener segmentos' }, { status: 500 });
  }
}
