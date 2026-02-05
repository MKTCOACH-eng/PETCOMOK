import Link from 'next/link';
import prisma from '@/lib/db';
import { Package, Truck, Clock, CheckCircle, AlertTriangle, MapPin, ExternalLink } from 'lucide-react';
import { SHIPMENT_STATUS } from '@/lib/shipping';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  label_created: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-yellow-100 text-yellow-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  exception: 'bg-red-100 text-red-800',
  returned: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  label_created: 'Guía Generada',
  picked_up: 'Recolectado',
  in_transit: 'En Tránsito',
  out_for_delivery: 'En Camino',
  delivered: 'Entregado',
  exception: 'Excepción',
  returned: 'Devuelto',
};

export default async function EnviosPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = searchParams.status;
  
  // Get all shipments
  const shipments = await prisma.shipment.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: {
      order: {
        select: {
          id: true,
          shippingName: true,
          shippingCity: true,
          shippingState: true,
          total: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get orders without shipment (pending to ship)
  const pendingOrders = await prisma.order.findMany({
    where: {
      shipment: null,
      status: { in: ['pending', 'processing'] },
    },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Stats
  const stats = {
    pending: await prisma.shipment.count({ where: { status: 'pending' } }) + pendingOrders.length,
    inTransit: await prisma.shipment.count({ where: { status: { in: ['in_transit', 'out_for_delivery'] } } }),
    delivered: await prisma.shipment.count({ where: { status: 'delivered' } }),
    exceptions: await prisma.shipment.count({ where: { status: { in: ['exception', 'returned'] } } }),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Envíos</h1>
          <p className="text-gray-600 mt-1">Genera guías y rastrea paquetes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Por Enviar</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
              <p className="text-sm text-gray-600">En Tránsito</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-sm text-gray-600">Entregados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.exceptions}</p>
              <p className="text-sm text-gray-600">Excepciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Orders Section */}
      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Pedidos Pendientes de Envío ({pendingOrders.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingOrders.map((order) => (
              <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Package className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      {order.shippingName} · {order.shippingCity}, {order.shippingState}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items.length} producto(s) · {new Date(order.createdAt).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Pendiente</span>
                  </div>
                  <Link
                    href={`/admin/envios/crear/${order.id}`}
                    className="px-4 py-2 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-medium transition-colors"
                  >
                    Generar Guía
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipments Filter */}
      <div className="bg-white rounded-xl shadow-sm mb-4">
        <div className="p-4 flex flex-wrap gap-2">
          <Link
            href="/admin/envios"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !statusFilter ? 'bg-[#7baaf7] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </Link>
          {Object.entries(statusLabels).map(([key, label]) => (
            <Link
              key={key}
              href={`/admin/envios?status=${key}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === key ? 'bg-[#7baaf7] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white rounded-xl shadow-sm">
        {shipments.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay envíos registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Truck className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{shipment.trackingNumber}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[shipment.status]}`}>
                        {statusLabels[shipment.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {shipment.carrierName} - {shipment.serviceName}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {shipment.order?.shippingCity}, {shipment.order?.shippingState}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">Pedido #{shipment.order?.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(shipment.createdAt).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {shipment.labelUrl && (
                      <a
                        href={shipment.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Etiqueta
                      </a>
                    )}
                    <a
                      href={`/rastreo/${shipment.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      Rastrear
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
