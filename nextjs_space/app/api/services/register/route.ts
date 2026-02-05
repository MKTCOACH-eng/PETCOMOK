import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessName,
      description,
      shortDescription,
      categoryId,
      contactName,
      email,
      phone,
      whatsapp,
      password,
      address,
      city,
      state,
      zipCode,
      serviceArea,
      services,
      schedule
    } = body;

    // Validaciones básicas
    if (!businessName || !description || !categoryId || !contactName || !email || !phone || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Verificar que el email no esté registrado
    const existingProvider = await prisma.serviceProvider.findFirst({
      where: { email }
    });

    if (existingProvider) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 400 });
    }

    // Generar slug único
    let slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existingSlug = await prisma.serviceProvider.findFirst({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear proveedor
    const provider = await prisma.serviceProvider.create({
      data: {
        businessName,
        slug,
        description,
        shortDescription: shortDescription || description.substring(0, 150),
        categoryId,
        contactName,
        email,
        phone,
        whatsapp,
        password: hashedPassword,
        address,
        city,
        state,
        zipCode,
        serviceArea,
        services: services || [],
        schedule: schedule || {},
        membershipStatus: 'pending', // Pendiente hasta que pague
        membershipPrice: 299,
        isApproved: false, // Requiere aprobación del admin
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Registro exitoso. Tu cuenta será revisada y activada pronto.',
      providerId: provider.id
    });
  } catch (error) {
    console.error('Error registering provider:', error);
    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 });
  }
}
