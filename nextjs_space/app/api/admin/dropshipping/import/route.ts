import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import { getProductById, convertToLocalProduct, isCJConfigured } from '@/lib/cjdropshipping';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.isAdmin === true;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!isCJConfigured()) {
    return NextResponse.json({ 
      error: 'CJdropshipping API not configured',
      configured: false 
    }, { status: 400 });
  }

  try {
    const { productIds, margin = 50, categoryId } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    // Get or create CJdropshipping supplier
    let supplier = await prisma.supplier.findFirst({
      where: { name: 'CJdropshipping' }
    });

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: 'CJdropshipping',
          email: 'support@cjdropshipping.com',
          website: 'https://cjdropshipping.com',
          isActive: true,
          notes: 'Dropshipping supplier - Auto created',
        }
      });
    }

    // Get default category if not provided
    let category = null;
    if (categoryId) {
      category = await prisma.category.findUnique({ where: { id: categoryId } });
    }
    if (!category) {
      category = await prisma.category.findFirst({ where: { slug: 'accesorios' } });
    }
    if (!category) {
      category = await prisma.category.findFirst();
    }
    if (!category) {
      return NextResponse.json({ error: 'No categories found. Create a category first.' }, { status: 400 });
    }

    const results = {
      success: [] as string[],
      errors: [] as { pid: string; error: string }[],
    };

    for (const pid of productIds) {
      try {
        // Get full product details from CJ
        const cjProduct = await getProductById(pid);
        const localProduct = convertToLocalProduct(cjProduct, margin);

        // Check if product already exists
        const existing = await prisma.product.findFirst({
          where: { sku: localProduct.sku }
        });

        if (existing) {
          results.errors.push({ pid, error: 'Product already exists' });
          continue;
        }

        // Create product in database
        await prisma.product.create({
          data: {
            name: localProduct.name,
            description: localProduct.description,
            price: localProduct.price,
            compareAtPrice: localProduct.compareAtPrice,
            costPrice: localProduct.costPrice,
            imageUrl: localProduct.images[0] || '',
            images: localProduct.images,
            sku: localProduct.sku,
            weight: localProduct.weight,
            stock: localProduct.stock,
            supplierSku: localProduct.supplierSku,
            supplierPrice: localProduct.supplierPrice,
            supplierUrl: localProduct.supplierUrl,
            isDropshipping: true,
            supplierId: supplier.id,
            categoryId: category.id,
            isActive: true,
          }
        });

        results.success.push(pid);
      } catch (error) {
        results.errors.push({ 
          pid, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      imported: results.success.length,
      failed: results.errors.length,
      details: results,
    });
  } catch (error) {
    console.error('CJ Import Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error importing products' },
      { status: 500 }
    );
  }
}
