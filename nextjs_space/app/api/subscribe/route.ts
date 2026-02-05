import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, name, source = 'footer' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      // Reactivate if was inactive
      if (!existing.isActive) {
        await prisma.subscriber.update({
          where: { id: existing.id },
          data: { isActive: true, updatedAt: new Date() },
        });
        return NextResponse.json({ 
          message: '¡Bienvenido de vuelta! Tu suscripción ha sido reactivada.',
          reactivated: true 
        });
      }
      return NextResponse.json({ 
        message: 'Ya estás suscrito a nuestro newsletter.',
        alreadySubscribed: true 
      });
    }

    // Create new subscriber
    await prisma.subscriber.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        source,
        isActive: true,
      },
    });

    return NextResponse.json({ 
      message: '¡Gracias por suscribirte! Recibirás nuestras mejores ofertas.',
      success: true 
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Newsletter subscription endpoint' });
}
