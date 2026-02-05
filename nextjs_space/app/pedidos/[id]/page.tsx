import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, MapPin, Phone, Mail, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  product: {
    name: string;
    imageUrl: string;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Clock },
  processing: { label: 'Procesando', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Package },
  shipped: { label: 'Enviado', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: Truck },
  delivered: { label: 'Entregado', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle },
};

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/pedidos');
  }

  const order = await prisma.order.findUnique({
    where: { id: params?.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order || order.userId !== (session.user as { id: string }).id) {
    notFound();
  }

  const statusInfo = statusConfig[order?.status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <Link
            href="/pedidos"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7baaf7] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mis pedidos
          </Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.id.slice(-8).toUpperCase()}</h1>
                  <p className="text-gray-500 mt-1">
                    Realizado el{' '}
                    {new Date(order.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
                  <StatusIcon className="w-5 h-5" />
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Productos</h2>
              <div className="space-y-4">
                {order.items.map((item: OrderItem) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item?.product?.imageUrl || ''}
                        alt={item?.product?.name || ''}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/producto/${item.productId}`} className="font-medium text-gray-900 hover:text-[#7baaf7] transition-colors">
                        {item?.product?.name}
                      </Link>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/u
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Información de Envío</h2>
              <div className="space-y-3">
                {order.shippingName && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <User className="w-5 h-5 text-[#7baaf7]" />
                    <span>{order.shippingName}</span>
                  </div>
                )}
                {order.shippingAddress && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-[#7baaf7]" />
                    <span>{order.shippingAddress}</span>
                  </div>
                )}
                {order.shippingPhone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5 text-[#7baaf7]" />
                    <span>{order.shippingPhone}</span>
                  </div>
                )}
                {order.shippingEmail && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-[#7baaf7]" />
                    <span>{order.shippingEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#41b375]">
                    <span>Descuento</span>
                    <span>-${order.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-[#41b375]">Gratis</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/catalogo"
                className="block w-full py-3 mt-6 bg-[#7baaf7] hover:bg-[#6999e6] text-white text-center font-semibold rounded-lg transition-colors"
              >
                Seguir Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
