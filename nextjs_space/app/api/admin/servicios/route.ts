import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.isAdmin === true;
}

export async function GET(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const approved = searchParams.get('approved');

    const where: any = {};
    if (status) where.membershipStatus = status;
    if (approved !== null) where.isApproved = approved === 'true';

    const providers = await prisma.serviceProvider.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        _count: {
          select: { leads: true, reviews: true }
        }
      }
    });

    // Stats
    const stats = {
      total: await prisma.serviceProvider.count(),
      pending: await prisma.serviceProvider.count({ where: { isApproved: false } }),
      active: await prisma.serviceProvider.count({ where: { isApproved: true, membershipStatus: 'active' } }),
      totalLeads: await prisma.serviceLead.count()
    };

    return NextResponse.json({ providers, stats });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: 'Error al cargar proveedores' }, { status: 500 });
  }
}
