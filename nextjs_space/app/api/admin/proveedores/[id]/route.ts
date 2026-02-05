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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    
    const supplier = await prisma.supplier.update({
      where: { id: params.id },
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
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if supplier has products
    const products = await prisma.product.count({
      where: { supplierId: params.id },
    });

    if (products > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un proveedor con productos asociados' },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Error al eliminar proveedor' }, { status: 500 });
  }
}
