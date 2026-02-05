import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST - Activar mascota como perfil principal
export async function POST(
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
    const pet = await prisma.pet.findFirst({
      where: { id: params.id, userId },
    });

    if (!pet) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
    }

    // Deactivate all pets for this user
    await prisma.pet.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Activate the selected pet
    const activatedPet = await prisma.pet.update({
      where: { id: params.id },
      data: { isActive: true },
    });

    // Update user preferences
    await prisma.userPreferences.upsert({
      where: { userId },
      update: { activePetId: params.id },
      create: {
        userId,
        activePetId: params.id,
      },
    });

    return NextResponse.json(activatedPet);
  } catch (error) {
    console.error('Activate pet error:', error);
    return NextResponse.json({ error: 'Error al activar mascota' }, { status: 500 });
  }
}
