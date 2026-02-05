import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, customerName, customerEmail, customerPhone, petType, petName, message, serviceInterest } = body;

    if (!providerId || !customerName || !customerEmail) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Verificar que el proveedor existe y está activo
    const provider = await prisma.serviceProvider.findFirst({
      where: {
        id: providerId,
        isApproved: true,
        isActive: true,
        membershipStatus: 'active'
      }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Proveedor no disponible' }, { status: 404 });
    }

    // Crear el lead
    const lead = await prisma.serviceLead.create({
      data: {
        providerId,
        customerName,
        customerEmail,
        customerPhone,
        petType,
        petName,
        message,
        serviceInterest,
        source: 'web'
      }
    });

    // Actualizar contador de leads del proveedor
    await prisma.serviceProvider.update({
      where: { id: providerId },
      data: { totalLeads: { increment: 1 } }
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Error al enviar solicitud' }, { status: 500 });
  }
}
