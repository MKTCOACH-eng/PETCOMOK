import prisma from '@/lib/db';
import { Tag, Check, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cupones</h1>
        <p className="text-gray-600">{coupons.length} cupones en total</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay cupones creados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descuento</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mínimo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Usos</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expira</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Activo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-[#7baaf7]/10 text-[#7baaf7] rounded font-semibold">
                      {coupon.code}
                    </code>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `$${coupon.discountValue.toLocaleString('es-MX')}`}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {coupon.minPurchase ? `$${coupon.minPurchase.toLocaleString('es-MX')}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString('es-MX')
                      : 'Sin expiración'}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <Check className="w-3 h-3" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        <X className="w-3 h-3" /> Inactivo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Los cupones se crearán directamente en la base de datos por ahora. Esta funcionalidad se expandirá en futuras fases.
      </p>
    </div>
  );
}
