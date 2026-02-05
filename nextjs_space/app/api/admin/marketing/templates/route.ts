import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true }
  });
  return user?.isAdmin === true;
}

// Get all templates
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const templates = await prisma.emailTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener plantillas' }, { status: 500 });
  }
}

// Create template
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category || 'general',
        subject: data.subject,
        preheader: data.preheader,
        content: data.content,
        thumbnail: data.thumbnail,
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear plantilla' }, { status: 500 });
  }
}
