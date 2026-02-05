import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            providers: {
              where: { isApproved: true, isActive: true, membershipStatus: 'active' }
            }
          }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json({ error: 'Error al cargar categorías' }, { status: 500 });
  }
}
