import Link from 'next/link';
import prisma from '@/lib/db';
import { ArrowLeft, Search, Download, Trash2, UserCheck, UserX } from 'lucide-react';
import { DeleteSubscriberButton } from './delete-button';
import { ToggleStatusButton } from './toggle-status';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { search?: string; status?: string; source?: string };
}

export default async function SuscriptoresPage({ searchParams }: PageProps) {
  const { search, status, source } = searchParams;

  // Build filter
  const where: any = {};
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (status === 'active') where.isActive = true;
  if (status === 'inactive') where.isActive = false;
  if (source) where.source = source;

  const subscribers = await prisma.subscriber.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  // Get unique sources for filter
  const sources = await prisma.subscriber.findMany({
    select: { source: true },
    distinct: ['source']
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/marketing" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suscriptores</h1>
            <p className="text-gray-600">{subscribers.length} suscriptores encontrados</p>
          </div>
        </div>
        <Link
          href="/api/admin/marketing/export?format=csv"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Buscar por email o nombre..."
              defaultValue={search || ''}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
            />
          </div>
          <select
            name="status"
            defaultValue={status || ''}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <select
            name="source"
            defaultValue={source || ''}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
          >
            <option value="">Todas las fuentes</option>
            {sources.map((s) => (
              <option key={s.source} value={s.source}>{s.source}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] transition-colors"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fuente</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.length > 0 ? (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{sub.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{sub.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 capitalize">{sub.source}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {sub.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(sub.createdAt).toLocaleDateString('es-MX')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ToggleStatusButton subscriberId={sub.id} isActive={sub.isActive} />
                        <DeleteSubscriberButton subscriberId={sub.id} email={sub.email} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron suscriptores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
