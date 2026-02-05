import prisma from '@/lib/db';
import Link from 'next/link';
import { ShoppingCart, Eye, Package } from 'lucide-react';
import { UpdateStatusButton } from './update-status';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { status?: string };
}

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

const ALL_STATUSES = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

export default async function OrdersPage({ searchParams }: Props) {
  const where = searchParams.status ? { status: searchParams.status } : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, imageUrl: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-600">{orders.length} pedidos en total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !searchParams.status
              ? 'bg-[#7baaf7] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </Link>
        {ALL_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/pedidos?status=${status}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              searchParams.status === status
                ? statusColors[status].replace('100', '500').replace('800', 'white')
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {statusLabels[status]}
          </Link>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No hay pedidos</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.user.name || order.user.email} • {new Date(order.createdAt).toLocaleString('es-MX')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-gray-900">
                    ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  <UpdateStatusButton orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
              
              <div className="px-6 py-4">
                <p className="text-sm font-medium text-gray-700 mb-3">{order.items.length} productos</p>
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {item.product.name} x{item.quantity}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500">
                      +{order.items.length - 4} más
                    </div>
                  )}
                </div>

                {order.shippingAddress && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Envío:</span> {order.shippingName} • {order.shippingAddress}
                    </p>
                    {order.shippingPhone && (
                      <p className="text-sm text-gray-500">
                        Tel: {order.shippingPhone} • {order.shippingEmail}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
