import Link from 'next/link';
import prisma from '@/lib/db';
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Upload, 
  Send, 
  UserPlus,
  UserMinus,
  Calendar
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MarketingPage() {
  // Fetch subscriber statistics
  const totalSubscribers = await prisma.subscriber.count();
  const activeSubscribers = await prisma.subscriber.count({ where: { isActive: true } });
  const inactiveSubscribers = totalSubscribers - activeSubscribers;
  
  // New subscribers this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const newThisMonth = await prisma.subscriber.count({
    where: {
      createdAt: { gte: startOfMonth }
    }
  });
  
  // Subscribers by source
  const subscribersBySource = await prisma.subscriber.groupBy({
    by: ['source'],
    _count: { source: true },
    where: { isActive: true }
  });
  
  // Recent subscribers
  const recentSubscribers = await prisma.subscriber.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  // Growth calculation (last 30 days vs previous 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const last30Days = await prisma.subscriber.count({
    where: { createdAt: { gte: thirtyDaysAgo } }
  });
  const prev30Days = await prisma.subscriber.count({
    where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
  });
  const growthPercent = prev30Days > 0 ? Math.round(((last30Days - prev30Days) / prev30Days) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-gray-600">Gestiona tu newsletter y campañas de email</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/marketing/importar"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar
          </Link>
          <Link
            href="/admin/marketing/campanas/nueva"
            className="flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] transition-colors"
          >
            <Send className="w-4 h-4" />
            Nueva Campaña
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Suscriptores</p>
              <p className="text-2xl font-bold text-gray-900">{totalSubscribers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-green-600">{activeSubscribers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Nuevos este mes</p>
              <p className="text-2xl font-bold text-purple-600">{newThisMonth.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Crecimiento 30d</p>
              <p className={`text-2xl font-bold ${growthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthPercent >= 0 ? '+' : ''}{growthPercent}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${growthPercent >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <TrendingUp className={`w-6 h-6 ${growthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <Link
              href="/admin/marketing/suscriptores"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Ver Suscriptores</p>
                <p className="text-sm text-gray-500">{activeSubscribers} activos</p>
              </div>
            </Link>
            
            <Link
              href="/admin/marketing/importar"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Importar Lista</p>
                <p className="text-sm text-gray-500">Desde CSV/Excel</p>
              </div>
            </Link>
            
            <Link
              href="/admin/marketing/campanas"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Campañas de Email</p>
                <p className="text-sm text-gray-500">Envío masivo</p>
              </div>
            </Link>
            
            <Link
              href="/api/admin/marketing/export?format=csv"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Exportar Lista</p>
                <p className="text-sm text-gray-500">Descargar CSV</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Subscribers by Source */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Por Fuente</h2>
          <div className="space-y-3">
            {subscribersBySource.length > 0 ? (
              subscribersBySource.map((item) => (
                <div key={item.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 capitalize">{item.source}</span>
                  <span className="font-semibold text-gray-900">{item._count.source}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos aún</p>
            )}
          </div>
          
          {inactiveSubscribers > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-500">
                  <UserMinus className="w-4 h-4" />
                  Inactivos/Baja
                </span>
                <span className="font-medium text-red-600">{inactiveSubscribers}</span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Subscribers */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recientes</h2>
            <Link href="/admin/marketing/suscriptores" className="text-sm text-[#7baaf7] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {recentSubscribers.length > 0 ? (
              recentSubscribers.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{sub.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {sub.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay suscriptores aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
