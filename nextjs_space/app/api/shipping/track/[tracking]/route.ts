import { NextResponse } from 'next/server';
import { getTrackingInfo } from '@/lib/shipping';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { tracking: string } }
) {
  try {
    const trackingNumber = params.tracking;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Número de rastreo requerido' },
        { status: 400 }
      );
    }

    // First check if we have this shipment in our database
    const shipment = await prisma.shipment.findFirst({
      where: { trackingNumber },
      include: {
        order: {
          select: {
            id: true,
            shippingName: true,
            shippingCity: true,
            shippingState: true,
          },
        },
      },
    });

    // Get tracking info from carrier (simulated)
    const trackingInfo = await getTrackingInfo(trackingNumber);

    if (!trackingInfo) {
      return NextResponse.json(
        { error: 'No se encontró información de rastreo' },
        { status: 404 }
      );
    }

    // If we have the shipment, update its status
    if (shipment && trackingInfo.status !== shipment.status) {
      const statusHistory = JSON.parse(shipment.statusHistory as string || '[]');
      statusHistory.push({
        status: trackingInfo.status,
        date: new Date().toISOString(),
        description: trackingInfo.statusLabel,
      });

      await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: trackingInfo.status,
          statusHistory: JSON.stringify(statusHistory),
          deliveredAt: trackingInfo.status === 'delivered' ? new Date() : undefined,
        },
      });

      // Update order status if delivered
      if (trackingInfo.status === 'delivered') {
        await prisma.order.update({
          where: { id: shipment.orderId },
          data: { status: 'completed' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      tracking: trackingInfo,
      shipment: shipment ? {
        id: shipment.id,
        orderId: shipment.order?.id,
        destination: shipment.order ? {
          name: shipment.order.shippingName,
          city: shipment.order.shippingCity,
          state: shipment.order.shippingState,
        } : null,
      } : null,
    });
  } catch (error) {
    console.error('Error getting tracking info:', error);
    return NextResponse.json(
      { error: 'Error al obtener información de rastreo' },
      { status: 500 }
    );
  }
}
