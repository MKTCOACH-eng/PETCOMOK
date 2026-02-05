'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

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
  const [search, setSearch] = useState(currentSearch || '');

  useEffect(() => {
    setSearch(currentSearch || '');
  }, [currentSearch]);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    router.push(`/catalogo?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    router.push(`/catalogo?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    router.push('/catalogo');
  };

  const hasFilters = currentCategory || currentSearch;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#7baaf7] transition-colors"
            />
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !currentCategory
                ? 'bg-[#7baaf7] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentCategory === cat.slug
                  ? 'bg-[#7baaf7] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
