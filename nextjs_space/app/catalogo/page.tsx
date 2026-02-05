import { Suspense } from 'react';
import prisma from '@/lib/db';
import { ProductCard } from '@/components/product-card';
import { CatalogFilters } from './catalog-filters';
import { Search, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { category?: string; search?: string; subcategory?: string };
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

const CATEGORY_TITLES: Record<string, { title: string; subtitle: string }> = {
  perros: {
    title: 'Todo para tu perro',
    subtitle: 'Los mejores productos para el consentido de la casa',
  },
  gatos: {
    title: 'Para tu felino favorito',
    subtitle: 'Productos que harán ronronear a tu gato',
  },
  'mascotas-pequenas': {
    title: 'Mascotas pequeñas, gran amor',
    subtitle: 'Cuidados especiales para tus pequeños compañeros',
  },
  aves: {
    title: 'Para tus amigos emplumados',
    subtitle: 'Todo lo que necesitan para cantar de felicidad',
  },
};

async function getProducts(category?: string, search?: string, subcategory?: string) {
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

  // Subcategory filter - search in tags or name
  if (subcategory) {
    const subcatWhere = [
      { name: { contains: subcategory, mode: 'insensitive' } },
      { description: { contains: subcategory, mode: 'insensitive' } },
    ];
    if (where.OR) {
      // Combine with existing OR
      where.AND = [{ OR: where.OR }, { OR: subcatWhere }];
      delete where.OR;
    } else {
      where.OR = subcatWhere;
    }
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
    getProducts(searchParams?.category, searchParams?.search, searchParams?.subcategory),
    getCategories(),
  ]);

  const categoryInfo = searchParams?.category 
    ? CATEGORY_TITLES[searchParams.category] 
    : null;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryInfo ? categoryInfo.title : 'Nuestros productos'}
          </h1>
          <p className="text-gray-600">
            {categoryInfo 
              ? categoryInfo.subtitle 
              : 'Descubre todo lo que tenemos para el bienestar de tu mascota'}
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

        {/* Results info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{products.length}</span> {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
          {searchParams?.search && (
            <p className="text-sm text-gray-500">
              Resultados para: <span className="font-medium text-[#7baaf7]">"{searchParams.search}"</span>
            </p>
          )}
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
            <div className="w-16 h-16 bg-[#7baaf7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#7baaf7]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No encontramos lo que buscas
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta con otros filtros o explora otras categorías
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[#ba67c8]">
              <Sparkles className="w-4 h-4" />
              <span>Pronto tendremos más productos para ti</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
