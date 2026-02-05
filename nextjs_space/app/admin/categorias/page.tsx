import prisma from '@/lib/db';
import { Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <p className="text-gray-600">{categories.length} categorías en total</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Productos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#7baaf7]/10 rounded-lg flex items-center justify-center">
                      <Tag className="w-5 h-5 text-[#7baaf7]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cat.name}</p>
                      {cat.description && (
                        <p className="text-sm text-gray-500">{cat.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{cat.slug}</code>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {cat._count.products}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        Las categorías se gestionan directamente en la base de datos. Contacta al desarrollador para agregar nuevas categorías.
      </p>
    </div>
  );
}
