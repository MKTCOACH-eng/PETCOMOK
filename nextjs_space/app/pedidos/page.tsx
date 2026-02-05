'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, Lock, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl: string;
    };
  }>;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  processing: { label: 'Procesando', color: 'text-blue-600 bg-blue-50', icon: Package },
  shipped: { label: 'Enviado', color: 'text-purple-600 bg-purple-50', icon: Truck },
  delivered: { label: 'Entregado', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-50', icon: XCircle },
};

export default function PedidosPage() {
  const { data: session, status: authStatus } = useSession() || {};
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchOrders();
    } else if (authStatus === 'unauthenticated') {
      setLoading(false);
    }
  }, [authStatus]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7baaf7]"></div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F8FA]">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm">
          <Lock className="w-16 h-16 text-[#7baaf7] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión para ver tus pedidos</h1>
          <p className="text-gray-600 mb-6">Necesitas una cuenta para acceder a tus pedidos</p>
          <Link
            href="/auth/login?callbackUrl=/pedidos"
            className="inline-block w-full py-3 bg-[#7baaf7] text-white font-semibold rounded-lg hover:bg-[#6999e6] transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes pedidos</h2>
            <p className="text-gray-600 mb-6">Explora nuestro catálogo y encuentra lo mejor para tu mascota</p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7baaf7] text-white font-semibold rounded-lg hover:bg-[#6999e6] transition-colors"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusInfo = statusConfig[order?.status] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/pedidos/${order.id}`}
                    className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm text-gray-500">Pedido #{order.id.slice(-8).toUpperCase()}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {order.items.slice(0, 3).map((item) => (
                            <span key={item.id} className="text-sm text-gray-600">
                              {item.quantity}x {item.product?.name}
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-sm text-gray-400">+{order.items.length - 3} más</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="font-bold text-gray-900">
                            ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
