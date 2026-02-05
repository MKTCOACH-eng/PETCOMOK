import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import { searchProducts, isCJConfigured, CJ_PET_CATEGORIES } from '@/lib/cjdropshipping';

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
    const { keyword, page = 1, pageSize = 20, petOnly = true } = await request.json();

    // Add pet filter if petOnly is true
    const searchKeyword = petOnly 
      ? `pet ${keyword}`.trim()
      : keyword;

    const result = await searchProducts(searchKeyword, page, pageSize);

    // Filter results to only include pet-related products if needed
    const filteredProducts = petOnly
      ? result.list.filter(p => 
          CJ_PET_CATEGORIES.some(cat => 
            p.categoryName?.toLowerCase().includes(cat.toLowerCase()) ||
            p.productNameEn?.toLowerCase().includes('pet') ||
            p.productNameEn?.toLowerCase().includes('dog') ||
            p.productNameEn?.toLowerCase().includes('cat') ||
            p.productNameEn?.toLowerCase().includes('bird')
          )
        )
      : result.list;

    return NextResponse.json({
      products: filteredProducts,
      total: filteredProducts.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('CJ Search Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error searching products' },
      { status: 500 }
    );
  }
}
