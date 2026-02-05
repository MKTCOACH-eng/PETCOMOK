import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  } | null;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
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

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#F7F8FA] py-12">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-[#41b375]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#41b375]" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-gray-600 mb-6">
            Gracias por tu compra. Hemos recibido tu pedido y te notificaremos cuando esté en camino.
          </p>

          {/* Order Summary */}
          <div className="bg-[#F7F8FA] rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-sm">Número de Pedido</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              #{order.id.slice(-8).toUpperCase()}
            </p>
          </div>

          <div className="text-left border-t border-gray-100 pt-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Resumen:</p>
            <div className="space-y-2">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item?.product?.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href={`/pedidos/${order.id}`}
              className="block w-full py-3 bg-[#7baaf7] hover:bg-[#6999e6] text-white font-semibold rounded-lg transition-colors"
            >
              Ver Detalles del Pedido
            </Link>
            <Link
              href="/catalogo"
              className="flex items-center justify-center gap-2 w-full py-3 text-[#7baaf7] hover:bg-[#7baaf7]/10 font-medium rounded-lg transition-colors"
            >
              Seguir Comprando
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
