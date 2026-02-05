import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import { isCJConfigured } from '@/lib/cjdropshipping';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.isAdmin === true;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const configured = isCJConfigured();

    // Get dropshipping stats (products with supplier = dropshipping)
    const dropshippingProducts = await prisma.product.count({
      where: { supplierId: { not: null } }
    });

    const dropshippingOrders = await prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              supplierId: { not: null }
            }
          }
        }
      }
    });

    const pendingDropshipping = await prisma.order.count({
      where: {
        status: { in: ['pending', 'processing'] },
        items: {
          some: {
            product: {
              supplierId: { not: null }
            }
          }
        }
      }
    });

    // Get CJ supplier
    const cjSupplier = await prisma.supplier.findFirst({
      where: { name: 'CJdropshipping' }
    });

    return NextResponse.json({
      configured,
      supplierId: cjSupplier?.id || null,
      stats: {
        products: dropshippingProducts,
        totalOrders: dropshippingOrders,
        pendingOrders: pendingDropshipping,
      }
    });
  } catch (error) {
    console.error('Dropshipping Status Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching status' },
      { status: 500 }
    );
  }
}
