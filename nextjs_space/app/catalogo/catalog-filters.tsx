'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const MAIN_CATEGORIES = [
  {
    name: 'Perros',
    slug: 'perros',
    image: 'https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/iconos/WhatsApp%20Image%202026-02-04%20at%2018.21.09.jpeg',
  },
  {
    name: 'Gatos',
    slug: 'gatos',
    image: 'https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/iconos/WhatsApp%20Image%202026-02-04%20at%2018.22.33.jpeg',
  },
  {
    name: 'Mascotas Pequeñas',
    slug: 'mascotas-pequenas',
    image: 'https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/iconos/WhatsApp%20Image%202026-02-04%20at%2018.24.28.jpeg',
  },
  {
    name: 'Aves',
    slug: 'aves',
    image: 'https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/iconos/WhatsApp%20Image%202026-02-04%20at%2018.29.37.jpeg',
  },
];

const SUBCATEGORIES = [
  { name: 'Alimento', slug: 'alimento' },
  { name: 'Juguetes', slug: 'juguetes' },
  { name: 'Accesorios', slug: 'accesorios' },
  { name: 'Higiene', slug: 'higiene' },
  { name: 'Camas y Casas', slug: 'camas' },
  { name: 'Salud', slug: 'salud' },
];

export function CatalogFilters({ 
  categories, 
  currentCategory,
  currentSearch 
}: { 
  categories: Category[]; 
  currentCategory?: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSubcategory = searchParams?.get('subcategory') || '';

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams();
    if (slug) {
      params.set('category', slug);
    }
    if (currentSearch) {
      params.set('search', currentSearch);
    }
    router.push(`/catalogo?${params.toString()}`);
  };

  const handleSubcategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (slug) {
      params.set('subcategory', slug);
    } else {
      params.delete('subcategory');
    }
    router.push(`/catalogo?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/catalogo');
  };

  const hasFilters = currentCategory || currentSearch || currentSubcategory;

  return (
    <div className="space-y-4 mb-6">
      {/* Main Categories - Visual Cards */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">Tipo de mascota</h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#e67c73] transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              !currentCategory
                ? 'bg-[#7baaf7] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {MAIN_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                currentCategory === cat.slug
                  ? 'bg-[#7baaf7] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories - Show when a main category is selected */}
      {currentCategory && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-medium text-gray-700 mb-3">¿Qué estás buscando?</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSubcategoryChange('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !currentSubcategory
                  ? 'bg-[#41b375] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todo
            </button>
            {SUBCATEGORIES.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => handleSubcategoryChange(sub.slug)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentSubcategory === sub.slug
                    ? 'bg-[#41b375] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
