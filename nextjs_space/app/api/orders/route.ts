import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

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
    const { items, shippingData } = body;

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

    // Build shipping address string
    const shippingAddress = `${shippingData?.address}, ${shippingData?.city}, ${shippingData?.state} ${shippingData?.zipCode}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'pending',
        total: subtotal,
        subtotal,
        discount: 0,
        shippingAddress,
        shippingName: shippingData?.name,
        shippingPhone: shippingData?.phone,
        shippingEmail: shippingData?.email,
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
