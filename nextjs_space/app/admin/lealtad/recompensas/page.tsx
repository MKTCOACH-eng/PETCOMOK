'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Gift, Percent, DollarSign, Truck, Package } from 'lucide-react';

const rewardTypes = [
  { value: 'DISCOUNT_PERCENT', label: 'Descuento %', icon: Percent },
  { value: 'DISCOUNT_FIXED', label: 'Descuento Fijo', icon: DollarSign },
  { value: 'FREE_SHIPPING', label: 'Envío Gratis', icon: Truck },
  { value: 'FREE_PRODUCT', label: 'Producto Gratis', icon: Package },
];

export default function RecompensasPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'DISCOUNT_PERCENT',
    pointsCost: 500,
    value: 10,
    minPurchase: 0,
    maxDiscount: 0,
    validDays: 30,
    maxRedemptions: 0,
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    const res = await fetch('/api/admin/lealtad/rewards');
    const data = await res.json();
    setRewards(data.rewards || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingReward ? `/api/admin/lealtad/rewards/${editingReward.id}` : '/api/admin/lealtad/rewards';
    const method = editingReward ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowForm(false);
      setEditingReward(null);
      resetForm();
      fetchRewards();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta recompensa?')) return;
    await fetch(`/api/admin/lealtad/rewards/${id}`, { method: 'DELETE' });
    fetchRewards();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'DISCOUNT_PERCENT',
      pointsCost: 500,
      value: 10,
      minPurchase: 0,
      maxDiscount: 0,
      validDays: 30,
      maxRedemptions: 0,
      isActive: true,
      isFeatured: false,
    });
  };

  const startEdit = (reward: any) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      type: reward.type,
      pointsCost: reward.pointsCost,
      value: reward.value,
      minPurchase: reward.minPurchase || 0,
      maxDiscount: reward.maxDiscount || 0,
      validDays: reward.validDays,
      maxRedemptions: reward.maxRedemptions || 0,
      isActive: reward.isActive,
      isFeatured: reward.isFeatured,
    });
    setShowForm(true);
  };

  const getTypeIcon = (type: string) => {
    const t = rewardTypes.find(r => r.value === type);
    return t ? t.icon : Gift;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#7baaf7] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/lealtad" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Recompensas</h1>
        </div>
        <button
          onClick={() => { resetForm(); setEditingReward(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6]"
        >
          <Plus className="w-4 h-4" />
          Nueva Recompensa
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">{editingReward ? 'Editar' : 'Nueva'} Recompensa</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: 10% de descuento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {rewardTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Costo en Puntos</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {formData.type === 'DISCOUNT_PERCENT' ? 'Porcentaje (%)' : 'Valor ($)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Compra Mínima</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Días de Validez</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.validDays}
                    onChange={(e) => setFormData({ ...formData, validDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Límite de Canjes (0 = ilimitado)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxRedemptions}
                    onChange={(e) => setFormData({ ...formData, maxRedemptions: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  Activa
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  Destacada
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6]">
                  {editingReward ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rewards List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const Icon = getTypeIcon(reward.type);
          return (
            <div key={reward.id} className={`bg-white rounded-xl p-5 shadow-sm border ${!reward.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Icon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(reward)} className="p-1.5 hover:bg-gray-100 rounded">
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(reward.id)} className="p-1.5 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">{reward.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{reward.description}</p>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-lg font-bold text-amber-600">{reward.pointsCost.toLocaleString()} pts</span>
                <span className="text-xs text-gray-500">{reward.timesRedeemed} canjes</span>
              </div>
              {reward.isFeatured && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                  ⭐ Destacada
                </span>
              )}
            </div>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay recompensas configuradas</p>
        </div>
      )}
    </div>
  );
}
