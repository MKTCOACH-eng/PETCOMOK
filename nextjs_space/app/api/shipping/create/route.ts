import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import { createShipment, PETCOM_ORIGIN, DEFAULT_PACKAGE, ShippingAddress } from '@/lib/shipping';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, rateId, carrier, serviceName, serviceType, shippingCost } = body;

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    if (order.shipment) {
      return NextResponse.json(
        { error: 'Este pedido ya tiene una guía de envío' },
        { status: 400 }
      );
    }

    // Build destination address
    const destination: ShippingAddress = {
      name: order.shippingName || '',
      street: order.shippingAddress || '',
      city: order.shippingCity || '',
      state: order.shippingState || '',
      zipCode: order.shippingZipCode || '',
      phone: order.shippingPhone || '',
      email: order.shippingEmail || '',
    };

    // Calculate total weight from products
    const totalWeight = order.items.reduce((sum, item) => {
      return sum + ((item.product.weight || 500) / 1000) * item.quantity; // Convert grams to kg
    }, 0);

    const packageInfo = {
      ...DEFAULT_PACKAGE,
      weight: Math.max(0.5, totalWeight),
      declaredValue: order.total,
    };

    // Create shipment with carrier
    const shipmentResult = await createShipment(
      rateId,
      PETCOM_ORIGIN,
      destination,
      packageInfo
    );

    // Calculate estimated delivery
    const estimatedDelivery = shipmentResult.estimatedDelivery;

    // Create shipment record in database
    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: carrier.toLowerCase().replace(/\s/g, ''),
        carrierName: carrier,
        serviceType: serviceType || 'standard',
        serviceName: serviceName,
        trackingNumber: shipmentResult.trackingNumber,
        trackingUrl: shipmentResult.trackingUrl,
        labelUrl: shipmentResult.labelUrl,
        shippingCost: shippingCost,
        totalCost: shippingCost,
        weight: packageInfo.weight,
        status: 'label_created',
        statusHistory: JSON.stringify([{
          status: 'label_created',
          date: new Date().toISOString(),
          description: 'Guía de envío generada',
        }]),
        estimatedDelivery: estimatedDelivery,
        enviaShipmentId: shipmentResult.shipmentId,
        enviaRateId: rateId,
      },
    });

    // Update order status to processing
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'processing' },
    });

    return NextResponse.json({
      success: true,
      shipment,
      trackingNumber: shipmentResult.trackingNumber,
      trackingUrl: shipmentResult.trackingUrl,
      labelUrl: shipmentResult.labelUrl,
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json(
      { error: 'Error al crear el envío' },
      { status: 500 }
    );
  }
}
