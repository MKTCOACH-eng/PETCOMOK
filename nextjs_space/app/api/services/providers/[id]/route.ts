import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const provider = await prisma.serviceProvider.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ],
        isApproved: true,
        isActive: true,
        membershipStatus: 'active'
      },
      include: {
        category: true,
        reviews: {
          where: { isApproved: true, isVisible: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    // Incrementar vistas
    await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: { totalViews: { increment: 1 } }
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json({ error: 'Error al cargar proveedor' }, { status: 500 });
  }
}
