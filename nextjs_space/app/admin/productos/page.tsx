import prisma from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Upload, Download, Package, FileSpreadsheet } from 'lucide-react';
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
      include: { category: true, supplier: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600">{products.length} productos en total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/productos/importar"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar CSV
          </Link>
          <div className="relative group">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <a
                href="/api/admin/export/products?format=xlsx"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel (.xlsx)
              </a>
              <a
                href="/api/admin/export/products?format=csv"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </a>
            </div>
          </div>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </Link>
        </div>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Margen</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay productos</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const margin = product.costPrice
                    ? ((product.price - product.costPrice) / product.price * 100).toFixed(0)
                    : null;
                  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
                  
                  return (
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
                            {product.supplier && (
                              <p className="text-xs text-purple-600">📦 {product.supplier.name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{product.sku || '-'}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-medium text-gray-900">
                            ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                          {hasDiscount && (
                            <span className="ml-2 text-xs text-gray-400 line-through">
                              ${product.compareAtPrice?.toLocaleString('es-MX')}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">IVA {product.taxRate}%</span>
                      </td>
                      <td className="px-6 py-4">
                        {margin ? (
                          <span className={`font-medium ${parseInt(margin) >= 30 ? 'text-green-600' : parseInt(margin) >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {margin}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {product.isActive ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium w-fit">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium w-fit">
                              Inactivo
                            </span>
                          )}
                          {product.featured && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium w-fit">
                              ⭐ Destacado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/productos/${product.id}`}
                            className="px-3 py-1.5 text-sm text-[#7baaf7] hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Editar
                          </Link>
                          <DeleteProductButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
