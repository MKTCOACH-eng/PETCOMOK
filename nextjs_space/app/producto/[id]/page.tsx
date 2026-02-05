import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/db';
import { ProductCard } from '@/components/product-card';
import { AddToCartButton } from './add-to-cart-button';
import { ArrowLeft, Package, Truck, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId: string;
  category: { name: string } | null;
}

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  return prisma.product.findMany({
    where: {
      categoryId,
      id: { not: excludeId },
    },
    include: { category: true },
    take: 4,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params?.id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <Link 
            href="/catalogo" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7baaf7] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Category Badge */}
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#7baaf7] mb-2">
                <Package className="w-4 h-4" />
                {product?.category?.name}
              </span>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-500 ml-2">MXN</span>
              </div>

              {/* Stock */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-2 text-[#41b375] font-medium">
                    <span className="w-2 h-2 bg-[#41b375] rounded-full" />
                    En stock ({product.stock} disponibles)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-red-500 font-medium">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Agotado
                  </span>
                )}
              </div>

              {/* Add to Cart */}
              <AddToCartButton product={product} />

              {/* Features */}
              <div className="mt-8 space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <Truck className="w-5 h-5 text-[#7baaf7]" />
                  <span>Envío gratis en compras mayores a $500</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5 text-[#41b375]" />
                  <span>Garantía de satisfacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: Product, index: number) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
