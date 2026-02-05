import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { sendEmail, generateWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // We need to add password field to schema, for now we'll use a workaround
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
      },
    });

    // Store password separately (in production, add password field to User model)
    await prisma.$executeRaw`UPDATE users SET password = ${hashedPassword} WHERE id = ${user.id}`;

    // Send welcome email
    const userName = user.name || email.split('@')[0];
    sendEmail({
      to: email,
      subject: `¡Bienvenido a PETCOM, ${userName}! 🐾`,
      body: generateWelcomeEmail(userName),
      notificationId: process.env.NOTIF_ID_EMAIL_DE_BIENVENIDA || '',
    }).catch(err => console.error('Welcome email failed:', err));

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
