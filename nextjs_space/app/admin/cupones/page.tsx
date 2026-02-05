import prisma from '@/lib/db';
import Link from 'next/link';
import { Ticket, Check, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { DeleteCouponButton } from './delete-button';

export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const activeCoupons = coupons.filter(c => c.isActive);
  const expiredCoupons = coupons.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cupones de Descuento</h1>
          <p className="text-gray-600">
            {coupons.length} cupones en total • {activeCoupons.length} activos
          </p>
        </div>
        <Link
          href="/admin/cupones/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cupón
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">{activeCoupons.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Ticket className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expirados</p>
              <p className="text-2xl font-bold text-gray-900">{expiredCoupons.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="mb-4">No hay cupones creados</p>
            <Link
              href="/admin/cupones/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear primer cupón
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descuento</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mínimo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Usos</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expira</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  const isMaxedOut = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
                  
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <code className="px-3 py-1.5 bg-[#7baaf7]/10 text-[#7baaf7] rounded-lg font-bold text-sm">
                          {coupon.code}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue.toLocaleString('es-MX')}`}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          {coupon.discountType === 'percentage' ? 'de descuento' : 'fijo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {coupon.minPurchase ? `$${coupon.minPurchase.toLocaleString('es-MX')}` : 'Sin mínimo'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${isMaxedOut ? 'text-red-600' : 'text-gray-900'}`}>
                          {coupon.usedCount}
                        </span>
                        <span className="text-gray-500">
                          {coupon.maxUses ? ` / ${coupon.maxUses}` : ' / ∞'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.expiresAt ? (
                          <span className={isExpired ? 'text-red-600' : 'text-gray-600'}>
                            {new Date(coupon.expiresAt).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        ) : (
                          <span className="text-gray-400">Sin límite</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!coupon.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            <X className="w-3 h-3" /> Inactivo
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Expirado
                          </span>
                        ) : isMaxedOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            Agotado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <Check className="w-3 h-3" /> Activo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/cupones/${coupon.id}`}
                            className="p-2 text-gray-500 hover:text-[#7baaf7] hover:bg-[#7baaf7]/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeleteCouponButton couponId={coupon.id} couponCode={coupon.code} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
