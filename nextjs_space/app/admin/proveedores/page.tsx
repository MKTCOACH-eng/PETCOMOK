import prisma from '@/lib/db';
import Link from 'next/link';
import { Plus, Truck, Globe, Mail, Phone, Edit } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600">Gestiona tus proveedores de dropshipping</p>
        </div>
        <Link
          href="/admin/proveedores/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proveedor
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">No hay proveedores configurados</p>
            <Link
              href="/admin/proveedores/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar proveedor
            </Link>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${supplier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {supplier.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/proveedores/${supplier.id}`}
                  className="p-2 text-gray-400 hover:text-[#7baaf7] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-2 text-sm">
                {supplier.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {supplier.email}
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {supplier.phone}
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4" />
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#7baaf7] truncate">
                      {supplier.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{supplier._count.products}</span> productos vinculados
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
