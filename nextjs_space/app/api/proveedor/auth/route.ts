import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'petcom-provider-secret';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const provider = await prisma.serviceProvider.findFirst({
      where: { email },
      include: { category: true }
    });

    if (!provider || !provider.password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, provider.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // Generar token JWT
    const token = jwt.sign(
      { providerId: provider.id, email: provider.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        businessName: provider.businessName,
        email: provider.email,
        membershipStatus: provider.membershipStatus,
        isApproved: provider.isApproved,
        category: provider.category
      }
    });

    // Set cookie
    response.cookies.set('provider_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return response;
  } catch (error) {
    console.error('Error authenticating provider:', error);
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('provider_token');
  return response;
}
