import { Suspense } from 'react';
import prisma from '@/lib/db';
import { ProductCard } from '@/components/product-card';
import { CatalogFilters } from './catalog-filters';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { category?: string; search?: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: { name: string } | null;
}

async function getProducts(category?: string, search?: string) {
  const where: Record<string, unknown> = {};
  
  if (category) {
    where.category = { slug: category };
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getCategories() {
  return prisma.category.findMany();
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const [products, categories] = await Promise.all([
    getProducts(searchParams?.category, searchParams?.search),
    getCategories(),
  ]);

  const currentCategory = categories.find((c: Category) => c.slug === searchParams?.category);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentCategory ? currentCategory.name : 'Catálogo'}
          </h1>
          <p className="text-gray-600">
            {currentCategory 
              ? currentCategory.description 
              : 'Explora todos nuestros productos premium para mascotas'}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Filters */}
        <Suspense fallback={<div className="h-14 bg-white rounded-lg animate-pulse" />}>
          <CatalogFilters 
            categories={categories} 
            currentCategory={searchParams?.category}
            currentSearch={searchParams?.search}
          />
        </Suspense>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: Product, index: number) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600">
              Intenta con otros filtros o términos de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
