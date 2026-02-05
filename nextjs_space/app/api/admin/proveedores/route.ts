import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });
  
  return user?.isAdmin === true;
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        apiKey: data.apiKey || null,
        apiUrl: data.apiUrl || null,
        notes: data.notes || null,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Error al crear proveedor' }, { status: 500 });
  }
}
