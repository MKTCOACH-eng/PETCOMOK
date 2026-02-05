import prisma from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { DeleteProductButton } from './delete-button';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { lowStock?: string; category?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
  const where: Record<string, unknown> = {};
  
  if (searchParams.lowStock === 'true') {
    where.stock = { lt: 10 };
  }
  if (searchParams.category) {
    where.categoryId = searchParams.category;
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600">{products.length} productos en total</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/productos"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !searchParams.lowStock && !searchParams.category
              ? 'bg-[#7baaf7] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </Link>
        <Link
          href="/admin/productos?lowStock=true"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            searchParams.lowStock === 'true'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Stock Bajo
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/admin/productos?category=${cat.id}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              searchParams.category === cat.id
                ? 'bg-[#7baaf7] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Destacado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay productos</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.featured ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          Destacado
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="p-2 text-gray-500 hover:text-[#7baaf7] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
