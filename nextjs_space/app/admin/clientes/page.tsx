import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Users, Search, Mail, ShoppingBag, Calendar, TrendingUp, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CustomerStats {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | null;
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { search?: string; sort?: string };
}) {
  const search = searchParams.search || '';
  const sort = searchParams.sort || 'recent';

  // Fetch all users with their order statistics
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    },
    include: {
      orders: {
        select: {
          id: true,
          total: true,
          createdAt: true,
          status: true,
        },
      },
      pets: true,
    },
  });

  // Calculate stats for each customer
  const customers: CustomerStats[] = users.map((user) => {
    const completedOrders = user.orders.filter(
      (o) => o.status !== 'cancelled'
    );
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const lastOrder = completedOrders.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      totalOrders: completedOrders.length,
      totalSpent,
      lastOrderDate: lastOrder?.createdAt || null,
    };
  });

  // Sort customers
  const sortedCustomers = [...customers].sort((a, b) => {
    switch (sort) {
      case 'spent':
        return b.totalSpent - a.totalSpent;
      case 'orders':
        return b.totalOrders - a.totalOrders;
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'recent':
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  // Calculate totals
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / Math.max(customers.reduce((sum, c) => sum + c.totalOrders, 0), 1);
  const customersWithOrders = customers.filter((c) => c.totalOrders > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes (CRM)</h1>
          <p className="text-gray-600 mt-1">Gestiona tu base de clientes</p>
        </div>
        <Link
          href="/api/admin/export/customers?format=xlsx"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ticket Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                ${avgOrderValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Con Compras</p>
              <p className="text-2xl font-bold text-gray-900">
                {customersWithOrders} ({totalCustomers > 0 ? Math.round((customersWithOrders / totalCustomers) * 100) : 0}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
            />
          </div>
          <select
            name="sort"
            defaultValue={sort}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
          >
            <option value="recent">Más recientes</option>
            <option value="spent">Mayor gasto</option>
            <option value="orders">Más pedidos</option>
            <option value="name">Nombre A-Z</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6] transition-colors"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Registro
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Gastado
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Último Pedido
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#7baaf7] rounded-full flex items-center justify-center text-white font-semibold">
                        {(customer.name || customer.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name || 'Sin nombre'}
                          {customer.isAdmin && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Admin
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {customer.createdAt.toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      customer.totalOrders > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {customer.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-semibold ${
                      customer.totalSpent > 1000
                        ? 'text-green-600'
                        : customer.totalSpent > 0
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}>
                      ${customer.totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {customer.lastOrderDate ? (
                      <span className="text-sm text-gray-600">
                        {customer.lastOrderDate.toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Sin pedidos</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/admin/clientes/${customer.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#7baaf7] hover:bg-[#7baaf7]/10 rounded-lg transition-colors"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron clientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
