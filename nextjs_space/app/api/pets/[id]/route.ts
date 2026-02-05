import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Obtener una mascota específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const pet = await prisma.pet.findFirst({
      where: { id: params.id, userId },
    });

    if (!pet) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(pet);
  } catch (error) {
    console.error('Get pet error:', error);
    return NextResponse.json({ error: 'Error al obtener mascota' }, { status: 500 });
  }
}

// PUT - Actualizar mascota
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { name, type, breed, age, weight, photoUrl } = body;

    // Verify ownership
    const existingPet = await prisma.pet.findFirst({
      where: { id: params.id, userId },
    });

    if (!existingPet) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
    }

    const pet = await prisma.pet.update({
      where: { id: params.id },
      data: {
        name,
        type,
        breed: breed || null,
        age: age ? parseInt(age) : null,
        weight: weight ? parseFloat(weight) : null,
        photoUrl: photoUrl || null,
      },
    });

    return NextResponse.json(pet);
  } catch (error) {
    console.error('Update pet error:', error);
    return NextResponse.json({ error: 'Error al actualizar mascota' }, { status: 500 });
  }
}

// DELETE - Eliminar mascota
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // Verify ownership
    const existingPet = await prisma.pet.findFirst({
      where: { id: params.id, userId },
    });

    if (!existingPet) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
    }

    await prisma.pet.delete({ where: { id: params.id } });

    // If deleted pet was active, activate another one
    if (existingPet.isActive) {
      const otherPet = await prisma.pet.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (otherPet) {
        await prisma.pet.update({
          where: { id: otherPet.id },
          data: { isActive: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete pet error:', error);
    return NextResponse.json({ error: 'Error al eliminar mascota' }, { status: 500 });
  }
}
