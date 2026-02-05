import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, authorName, authorEmail, rating, title, comment } = body;

    if (!providerId || !authorName || !rating || !comment) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating debe ser entre 1 y 5' }, { status: 400 });
    }

    const review = await prisma.serviceReview.create({
      data: {
        providerId,
        authorName,
        authorEmail,
        rating,
        title,
        comment,
        isApproved: false // Requiere aprobación del admin
      }
    });

    return NextResponse.json({ success: true, message: 'Review enviada, pendiente de aprobación' });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Error al enviar review' }, { status: 500 });
  }
}
