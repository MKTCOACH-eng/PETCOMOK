'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, PawPrint, ChevronRight, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  recommendationReason: string;
  category: {
    name: string;
    slug: string;
  };
}

export function PersonalizedRecommendations() {
  const { data: session } = useSession() || {};
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState<Pet | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [personalized, setPersonalized] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [session]);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/recommendations');
      if (res.ok) {
        const data = await res.json();
        setPet(data.pet);
        setProducts(data.products || []);
        setPersonalized(data.personalized);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    }, 1);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-[#7baaf7]/5 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7baaf7]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-[#7baaf7]/5 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#7baaf7] rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {personalized && pet
                  ? `Recomendado para ${pet.name}`
                  : 'Productos Destacados'}
              </h2>
            </div>
            {personalized && pet ? (
              <p className="text-gray-600">
                Seleccionados especialmente para tu {pet.type.toLowerCase()}
                {pet.breed && ` ${pet.breed}`} con inteligencia artificial
              </p>
            ) : (
              <p className="text-gray-600">
                <Link href="/mis-mascotas" className="text-[#7baaf7] hover:underline">
                  Registra tu mascota
                </Link>{' '}
                para obtener recomendaciones personalizadas
              </p>
            )}
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-[#7baaf7] hover:text-[#5a8fe6] font-medium"
          >
            Ver todo el catálogo
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
            >
              <Link href={`/producto/${product.id}`}>
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  {personalized && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#7baaf7] text-white text-xs rounded-full">
                        <Sparkles className="w-3 h-3" /> IA
                      </span>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <span className="text-xs text-[#7baaf7] font-medium">
                  {product.category.name}
                </span>
                <Link href={`/producto/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 hover:text-[#7baaf7]">
                    {product.name}
                  </h3>
                </Link>
                {product.recommendationReason && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">
                    "{product.recommendationReason}"
                  </p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-[#e67c73]">
                    ${product.price.toLocaleString('es-MX')}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="p-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6] transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA for non-registered users */}
        {!personalized && session && (
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#7baaf7]/10 to-[#e67c73]/10 rounded-xl">
              <PawPrint className="w-8 h-8 text-[#e67c73]" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Personaliza tu experiencia</p>
                <p className="text-sm text-gray-600">Registra a tu mascota y recibe recomendaciones únicas</p>
              </div>
              <Link
                href="/mis-mascotas"
                className="ml-4 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6] transition-colors"
              >
                Agregar Mascota
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
