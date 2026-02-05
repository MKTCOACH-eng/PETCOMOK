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

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { subscribers } = await request.json();

    if (!subscribers || !Array.isArray(subscribers)) {
      return NextResponse.json(
        { error: 'Formato inválido' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let success = 0;
    let duplicates = 0;
    const errors: { row: number; email: string; error: string }[] = [];

    for (let i = 0; i < subscribers.length; i++) {
      const sub = subscribers[i];
      const row = i + 2; // Account for header row and 0-index

      // Validate email
      if (!sub.email || !emailRegex.test(sub.email)) {
        errors.push({ row, email: sub.email || '(vacío)', error: 'Email inválido' });
        continue;
      }

      try {
        // Check for existing
        const existing = await prisma.subscriber.findUnique({
          where: { email: sub.email.toLowerCase() }
        });

        if (existing) {
          duplicates++;
          continue;
        }

        // Create new subscriber
        await prisma.subscriber.create({
          data: {
            email: sub.email.toLowerCase(),
            name: sub.name || null,
            source: sub.source || 'import',
            isActive: true,
          }
        });

        success++;
      } catch (error) {
        errors.push({ row, email: sub.email, error: 'Error al guardar' });
      }
    }

    return NextResponse.json({
      success,
      duplicates,
      errors
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Error en la importación' },
      { status: 500 }
    );
  }
}
