import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import { sendEmail, generateOrderConfirmationEmail, generateAdminOrderNotificationEmail } from '@/lib/email';
import { awardPointsForPurchase } from '@/lib/loyalty';

export const dynamic = 'force-dynamic';

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

interface ProductRecord {
  id: string;
  price: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shippingData, shippingRate, shippingCost } = body;

    if (!items?.length) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const userId = (session.user as { id: string }).id;

    // Verify products exist and get current prices
    const productIds = items.map((item: OrderItemInput) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      return NextResponse.json({ error: 'Algunos productos no están disponibles' }, { status: 400 });
    }

    // Calculate totals with verified prices
    const orderItems = items.map((item: OrderItemInput) => {
      const product = products.find((p: ProductRecord) => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product?.price ?? 0,
      };
    });

    const subtotal = orderItems.reduce(
      (sum: number, item: OrderItemInput) => sum + item.price * item.quantity,
      0
    );

    // Calculate total with shipping
    const finalShippingCost = shippingCost || 0;
    const total = subtotal + finalShippingCost;

    // Build shipping address string
    const shippingAddress = `${shippingData?.address}, ${shippingData?.city}, ${shippingData?.state} ${shippingData?.zipCode}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'pending',
        total,
        subtotal,
        discount: 0,
        shippingCost: finalShippingCost,
        shippingAddress,
        shippingName: shippingData?.name,
        shippingPhone: shippingData?.phone,
        shippingEmail: shippingData?.email,
        shippingCity: shippingData?.city,
        shippingState: shippingData?.state,
        shippingZipCode: shippingData?.zipCode,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Update product stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Award loyalty points
    try {
      // Check if this is first purchase
      const previousOrders = await prisma.order.count({
        where: { userId, id: { not: order.id } },
      });
      const isFirstPurchase = previousOrders === 0;
      
      const loyaltyResult = await awardPointsForPurchase(userId, order.id, subtotal, isFirstPurchase);
      if (loyaltyResult) {
        console.log(`Awarded ${loyaltyResult.currentPoints} points to user ${userId} for order ${order.id}`);
      }
    } catch (loyaltyError) {
      console.error('Error awarding loyalty points:', loyaltyError);
      // Don't fail the order if loyalty points fail
    }

    // Get user info for email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const customerName = user?.name || shippingData?.name || 'Cliente';
    const customerEmail = shippingData?.email || user?.email || '';

    // Send order confirmation email to customer
    if (customerEmail) {
      const orderDetails = {
        orderId: order.id,
        customerName,
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.product.imageUrl,
        })),
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        shippingAddress: order.shippingAddress || undefined,
      };

      // Send to customer
      sendEmail({
        to: customerEmail,
        subject: `¡Pedido confirmado! #${order.id.slice(-8).toUpperCase()}`,
        body: generateOrderConfirmationEmail(orderDetails),
        notificationId: process.env.NOTIF_ID_CONFIRMACIN_DE_PEDIDO || '',
      }).catch(err => console.error('Email to customer failed:', err));

      // Send admin notification
      sendEmail({
        to: 'lourdes@mktcoach.com.mx',
        subject: `Nuevo pedido #${order.id.slice(-8).toUpperCase()} - $${order.total.toLocaleString('es-MX')}`,
        body: generateAdminOrderNotificationEmail({ ...orderDetails, customerEmail }),
        notificationId: process.env.NOTIF_ID_NUEVO_PEDIDO_ADMIN || '',
      }).catch(err => console.error('Email to admin failed:', err));
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}
