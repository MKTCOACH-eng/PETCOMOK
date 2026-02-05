'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Ticket, Percent, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
}

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    discountType: coupon?.discountType || 'percentage',
    discountValue: coupon?.discountValue || 10,
    minPurchase: coupon?.minPurchase || 0,
    maxUses: coupon?.maxUses || 0,
    expiresAt: coupon?.expiresAt
      ? new Date(coupon.expiresAt).toISOString().split('T')[0]
      : '',
    isActive: coupon?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = coupon
        ? `/api/admin/cupones/${coupon.id}`
        : '/api/admin/cupones';
      
      const method = coupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase().trim(),
          minPurchase: formData.minPurchase || null,
          maxUses: formData.maxUses || null,
          expiresAt: formData.expiresAt || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      router.push('/admin/cupones');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el cupón');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'PETCOM';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código del Cupón *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent uppercase font-mono text-lg"
                placeholder="PETCOM20"
                required
              />
            </div>
            <button
              type="button"
              onClick={generateCode}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Generar
            </button>
          </div>
        </div>

        {/* Discount Type & Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Descuento
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, discountType: 'percentage' }))}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  formData.discountType === 'percentage'
                    ? 'border-[#7baaf7] bg-[#7baaf7]/10 text-[#7baaf7]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Percent className="w-5 h-5" />
                Porcentaje
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, discountType: 'fixed' }))}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  formData.discountType === 'fixed'
                    ? 'border-[#7baaf7] bg-[#7baaf7]/10 text-[#7baaf7]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                Monto Fijo
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor del Descuento *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {formData.discountType === 'percentage' ? '%' : '$'}
              </span>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                min="0"
                max={formData.discountType === 'percentage' ? 100 : undefined}
                step="0.01"
                required
              />
            </div>
          </div>
        </div>

        {/* Min Purchase & Max Uses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compra Mínima (opcional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.minPurchase || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, minPurchase: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Deja en 0 para sin mínimo</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usos Máximos (opcional)
            </label>
            <input
              type="number"
              value={formData.maxUses || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              min="0"
              placeholder="Ilimitado"
            />
            <p className="text-xs text-gray-500 mt-1">Deja en 0 para ilimitado</p>
          </div>
        </div>

        {/* Expiration & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Expiración (opcional)
            </label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <label className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 text-[#7baaf7] rounded focus:ring-[#7baaf7]"
              />
              <span className="text-gray-700">Cupón activo</span>
            </label>
          </div>
        </div>

        {/* Stats for existing coupon */}
        {coupon && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Este cupón ha sido usado <strong>{coupon.usedCount}</strong> veces.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/cupones"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : coupon ? 'Actualizar Cupón' : 'Crear Cupón'}
        </button>
      </div>
    </form>
  );
}
