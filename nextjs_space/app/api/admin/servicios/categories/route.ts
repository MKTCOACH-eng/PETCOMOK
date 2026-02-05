import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.isAdmin === true;
}

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { providers: true } }
      }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, order } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        order: order || 0
      }
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 });
  }
}
