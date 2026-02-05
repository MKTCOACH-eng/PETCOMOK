import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Obtener mascotas del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const pets = await prisma.pet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(pets);
  } catch (error) {
    console.error('Get pets error:', error);
    return NextResponse.json({ error: 'Error al obtener mascotas' }, { status: 500 });
  }
}

// POST - Crear nueva mascota
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { name, type, breed, age, weight, photoUrl } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nombre y tipo de mascota son requeridos' },
        { status: 400 }
      );
    }

    // Check how many pets the user has
    const petCount = await prisma.pet.count({ where: { userId } });
    
    const pet = await prisma.pet.create({
      data: {
        userId,
        name,
        type,
        breed: breed || null,
        age: age ? parseInt(age) : null,
        weight: weight ? parseFloat(weight) : null,
        photoUrl: photoUrl || null,
        isActive: petCount === 0, // First pet is active by default
      },
    });

    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    console.error('Create pet error:', error);
    return NextResponse.json({ error: 'Error al crear mascota' }, { status: 500 });
  }
}
