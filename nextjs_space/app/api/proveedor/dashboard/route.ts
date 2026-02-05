import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'petcom-provider-secret';

function getProviderFromToken(request: NextRequest) {
  const token = request.cookies.get('provider_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { providerId: string };
    return decoded.providerId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const providerId = getProviderFromToken(request);
    if (!providerId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: {
        category: true,
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        _count: {
          select: {
            leads: true,
            reviews: { where: { isApproved: true } }
          }
        }
      }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    // Estadísticas de leads por estado
    const leadStats = await prisma.serviceLead.groupBy({
      by: ['status'],
      where: { providerId },
      _count: { id: true }
    });

    // Leads de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLeadsCount = await prisma.serviceLead.count({
      where: {
        providerId,
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    return NextResponse.json({
      provider: {
        id: provider.id,
        businessName: provider.businessName,
        email: provider.email,
        phone: provider.phone,
        membershipStatus: provider.membershipStatus,
        membershipEndDate: provider.membershipEndDate,
        isApproved: provider.isApproved,
        totalLeads: provider.totalLeads,
        totalViews: provider.totalViews,
        totalReviews: provider.totalReviews,
        averageRating: provider.averageRating,
        category: provider.category
      },
      leads: provider.leads,
      reviews: provider.reviews,
      stats: {
        leadStats,
        recentLeadsCount,
        totalLeads: provider._count.leads,
        totalReviews: provider._count.reviews
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Error al cargar dashboard' }, { status: 500 });
  }
}
