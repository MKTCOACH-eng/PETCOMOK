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
    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        imageUrl: data.imageUrl,
        images: data.images || [],
        categoryId: data.categoryId,
        petTypes: data.petTypes || [],
        stock: data.stock || 0,
        sku: data.sku || null,
        barcode: data.barcode || null,
        weight: data.weight,
        featured: data.featured || false,
        isActive: data.isActive ?? true,
        tags: data.tags || [],
        taxRate: data.taxRate || 16,
        taxIncluded: data.taxIncluded ?? true,
        supplierId: data.supplierId,
        supplierSku: data.supplierSku || null,
        supplierPrice: data.supplierPrice,
        supplierUrl: data.supplierUrl || null,
        marginPercent: data.marginPercent,
        autoSync: data.autoSync || false,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const orderItems = await prisma.orderItem.count({
      where: { productId: params.id },
    });

    if (orderItems > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un producto con pedidos asociados' },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}
