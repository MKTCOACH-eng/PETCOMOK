import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import { createOrder, getOrderById, confirmOrder, isCJConfigured } from '@/lib/cjdropshipping';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.isAdmin === true;
}

// Create CJ order from PETCOM order
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!isCJConfigured()) {
    return NextResponse.json({ 
      error: 'CJdropshipping API not configured',
      configured: false 
    }, { status: 400 });
  }

  try {
    const { orderId, autoConfirm = false } = await request.json();

    // Get PETCOM order with items and products
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Filter only dropshipping items (products with supplier)
    const dropshippingItems = order.items.filter(item => item.product.supplierId !== null);

    if (dropshippingItems.length === 0) {
      return NextResponse.json({ error: 'No dropshipping items in this order' }, { status: 400 });
    }

    const shippingAddr = order.shippingAddress || '';

    // Create CJ order
    const cjOrderData = {
      orderNumber: order.id,
      shippingZip: order.shippingZipCode || '',
      shippingCountry: 'MX',
      shippingProvince: order.shippingState || '',
      shippingCity: order.shippingCity || '',
      shippingAddress: shippingAddr,
      shippingCustomerName: order.user?.name || 'Customer',
      shippingPhone: shippingAddr.match(/\d{10}/)?.[0] || '5555555555',
      products: dropshippingItems.map(item => ({
        vid: item.product.supplierSku || item.product.sku || '',
        quantity: item.quantity,
      })),
      remark: `PETCOM Order #${order.id}`,
    };

    const cjOrder = await createOrder(cjOrderData);

    // Update order with CJ reference
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'processing',
      }
    });

    // Auto-confirm (pay) the order if requested
    if (autoConfirm) {
      await confirmOrder(cjOrder.orderId);
    }

    return NextResponse.json({
      success: true,
      cjOrderId: cjOrder.orderId,
      cjOrderNum: cjOrder.orderNum,
      itemsProcessed: dropshippingItems.length,
    });
  } catch (error) {
    console.error('CJ Order Creation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating CJ order' },
      { status: 500 }
    );
  }
}

// Get CJ order status
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!isCJConfigured()) {
    return NextResponse.json({ 
      error: 'CJdropshipping API not configured',
      configured: false 
    }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const cjOrderId = searchParams.get('cjOrderId');

  if (!cjOrderId) {
    return NextResponse.json({ error: 'CJ Order ID required' }, { status: 400 });
  }

  try {
    const cjOrder = await getOrderById(cjOrderId);
    return NextResponse.json(cjOrder);
  } catch (error) {
    console.error('CJ Order Status Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching order' },
      { status: 500 }
    );
  }
}
