'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: { name: string } | null;
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <Link href={`/producto/${product.id}`} className="block">
        <div className="relative aspect-square bg-gray-100">
          {!imageError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">📦</span>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <span className="p-2 bg-white rounded-full shadow-lg">
                <Eye className="w-5 h-5 text-gray-700" />
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          {product?.category?.name && (
            <span className="text-xs text-[#7baaf7] font-medium uppercase tracking-wide">
              {product.category.name}
            </span>
          )}
          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-[#7baaf7] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Link>
      
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
            isAdding
              ? 'bg-[#41b375] text-white'
              : 'bg-[#7baaf7] hover:bg-[#6999e6] text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isAdding ? '¡Agregado!' : 'Agregar'}
        </button>
      </div>
    </motion.div>
  );
}
