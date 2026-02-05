import prisma from '@/lib/db';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, AlertCircle, Download, FileSpreadsheet, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { period?: string };
}

async function getStats(period: string) {
  const now = new Date();
  let startDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      prevEndDate = startDate;
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      prevEndDate = startDate;
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      prevStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      prevEndDate = startDate;
      break;
    default: // all
      startDate = new Date('2020-01-01');
      prevStartDate = new Date('2020-01-01');
      prevEndDate = new Date('2020-01-01');
  }

  const [products, allOrders, periodOrders, prevOrders, users, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({
      select: { total: true, status: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { total: true, status: true, createdAt: true },
    }),
    period !== 'all' ? prisma.order.findMany({
      where: { createdAt: { gte: prevStartDate, lt: prevEndDate } },
      select: { total: true, status: true },
    }) : Promise.resolve([]),
    prisma.user.count(),
    prisma.product.count({ where: { stock: { lt: 10 } } }),
  ]);

  const completedStatuses = ['completed', 'shipped'];
  
  const totalRevenue = allOrders
    .filter((o) => completedStatuses.includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  const periodRevenue = periodOrders
    .filter((o) => completedStatuses.includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  const prevRevenue = prevOrders
    .filter((o) => completedStatuses.includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;
  const periodOrdersCount = periodOrders.length;
  const prevOrdersCount = prevOrders.length;

  // Calculate growth
  const revenueGrowth = prevRevenue > 0 ? ((periodRevenue - prevRevenue) / prevRevenue * 100) : 0;
  const ordersGrowth = prevOrdersCount > 0 ? ((periodOrdersCount - prevOrdersCount) / prevOrdersCount * 100) : 0;

  // Average order value
  const avgOrderValue = periodOrdersCount > 0 ? periodRevenue / periodOrdersCount : 0;

  return {
    products,
    totalOrders: allOrders.length,
    periodOrders: periodOrdersCount,
    users,
    totalRevenue,
    periodRevenue,
    pendingOrders,
    lowStock,
    revenueGrowth,
    ordersGrowth,
    avgOrderValue,
  };
}

async function getTopProducts(limit = 10) {
  const orderItems = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    _count: true,
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  const productIds = orderItems.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  });

  return orderItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...product,
      totalSold: item._sum.quantity || 0,
      orderCount: item._count,
    };
  }).filter(p => p.id);
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

export default async function AdminDashboard({ searchParams }: Props) {
  const period = searchParams.period || 'all';
  const stats = await getStats(period);
  const topProducts = await getTopProducts();
  const recentOrders = await getRecentOrders();

  const periods = [
    { value: 'all', label: 'Todo' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
  ];

  const statCards = [
    {
      name: 'Ingresos del Período',
      value: `$${stats.periodRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      subvalue: `Total: $${stats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      change: stats.revenueGrowth,
      icon: DollarSign,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
    },
    {
      name: 'Pedidos del Período',
      value: stats.periodOrders,
      subvalue: `Total: ${stats.totalOrders}`,
      change: stats.ordersGrowth,
      icon: ShoppingCart,
      color: 'bg-[#7baaf7]',
      bgLight: 'bg-blue-50',
    },
    {
      name: 'Ticket Promedio',
      value: `$${stats.avgOrderValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      subvalue: 'Por pedido',
      icon: BarChart3,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
    },
    {
      name: 'Usuarios',
      value: stats.users,
      subvalue: `${stats.products} productos`,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Panel de administración de PETCOM</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period Filter */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {periods.map((p) => (
              <Link
                key={p.value}
                href={`/admin?period=${p.value}`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>
          {/* Export */}
          <div className="relative group">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <a
                href="/api/admin/export/orders?format=xlsx"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Pedidos Excel
              </a>
              <a
                href="/api/admin/export/products?format=xlsx"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Productos Excel
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className={`${stat.bgLight} rounded-xl p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subvalue}</p>
                  {stat.change !== undefined && period !== 'all' && (
                    <p className={`text-xs font-medium mt-1 ${
                      stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change).toFixed(1)}% vs periodo anterior
                    </p>
                  )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#7baaf7]" />
              <h2 className="font-semibold text-gray-900">Top 10 Productos Más Vendidos</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {topProducts.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Aún no hay ventas
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.id} className="px-6 py-3 flex items-center gap-4">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={product.imageUrl || ''}
                      alt={product.name || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{product.totalSold} uds</p>
                    <p className="text-xs text-gray-500">{product.orderCount} pedidos</p>
                  </div>
                </div>
              ))
            )}
          </div>
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
    </div>
  );
}
