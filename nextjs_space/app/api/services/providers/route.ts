import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '20');
    const featured = searchParams.get('featured') === 'true';

    const where: any = {
      isApproved: true,
      isActive: true,
      membershipStatus: 'active'
    };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (featured) {
      where.featured = true;
    }

    const providers = await prisma.serviceProvider.findMany({
      where,
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { averageRating: 'desc' },
        { totalLeads: 'desc' }
      ],
      include: {
        category: true,
        _count: {
          select: { reviews: { where: { isApproved: true } } }
        }
      }
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: 'Error al cargar proveedores' }, { status: 500 });
  }
}
