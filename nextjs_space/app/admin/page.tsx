import prisma from '@/lib/db';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [products, orders, users, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({
      select: { total: true, status: true, createdAt: true },
    }),
    prisma.user.count(),
    prisma.product.count({ where: { stock: { lt: 10 } } }),
  ]);

  const totalRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'shipped')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  // Orders from last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentOrders = orders.filter((o) => o.createdAt >= weekAgo).length;

  return {
    products,
    totalOrders: orders.length,
    users,
    totalRevenue,
    pendingOrders,
    recentOrders,
    lowStock,
  };
}

async function getRecentOrders() {
  return prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const recentOrders = await getRecentOrders();

  const statCards = [
    {
      name: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
    },
    {
      name: 'Pedidos Totales',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-[#7baaf7]',
      bgLight: 'bg-blue-50',
    },
    {
      name: 'Productos',
      value: stats.products,
      icon: Package,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
    },
    {
      name: 'Usuarios',
      value: stats.users,
      icon: Users,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
    },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al panel de administración de PETCOM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className={`${stat.bgLight} rounded-xl p-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {stats.pendingOrders > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-yellow-800">{stats.pendingOrders} pedidos pendientes</p>
              <Link href="/admin/pedidos?status=pending" className="text-sm text-yellow-600 hover:underline">
                Ver pedidos →
              </Link>
            </div>
          </div>
        )}
        {stats.lowStock > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">{stats.lowStock} productos con stock bajo</p>
              <Link href="/admin/productos?lowStock=true" className="text-sm text-red-600 hover:underline">
                Ver productos →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Últimos Pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm text-[#7baaf7] hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Aún no hay pedidos
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {order.user.name || order.user.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} productos • {new Date(order.createdAt).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
