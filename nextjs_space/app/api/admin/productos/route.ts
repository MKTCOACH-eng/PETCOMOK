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
    
    const product = await prisma.product.create({
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
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}

// Bulk create products
export async function PUT(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { products } = await req.json();
    
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Se esperaba un array de productos' }, { status: 400 });
    }

    // Get categories for mapping
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.slug.toLowerCase(), c.id]));

    const results = { created: 0, errors: [] as string[] };

    for (const item of products) {
      try {
        const categoryId = categoryMap.get(item.category?.toLowerCase()) || item.categoryId;
        
        if (!categoryId) {
          results.errors.push(`Producto "${item.name}": Categoría no encontrada`);
          continue;
        }

        await prisma.product.create({
          data: {
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price) || 0,
            compareAtPrice: item.compareAtPrice ? parseFloat(item.compareAtPrice) : null,
            costPrice: item.costPrice ? parseFloat(item.costPrice) : null,
            imageUrl: item.imageUrl || '',
            categoryId,
            petTypes: item.petTypes ? item.petTypes.split(',').map((t: string) => t.trim()) : [],
            stock: parseInt(item.stock) || 0,
            sku: item.sku || null,
            barcode: item.barcode || null,
            weight: item.weight ? parseFloat(item.weight) : null,
            featured: item.featured === 'true' || item.featured === true,
            isActive: item.isActive !== 'false' && item.isActive !== false,
            tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
            taxRate: parseFloat(item.taxRate) || 16,
            taxIncluded: item.taxIncluded !== 'false' && item.taxIncluded !== false,
          },
        });
        results.created++;
      } catch (err) {
        results.errors.push(`Producto "${item.name}": ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error bulk creating products:', error);
    return NextResponse.json({ error: 'Error al importar productos' }, { status: 500 });
  }
}
