'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Star, Users } from 'lucide-react';

const defaultColors = ['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2'];

export default function NivelesPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    minPoints: 0,
    minSpent: 0,
    pointsMultiplier: 1,
    discountPercent: 0,
    freeShipping: false,
    prioritySupport: false,
    earlyAccess: false,
    birthdayBonus: 0,
    color: '#7baaf7',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    const res = await fetch('/api/admin/lealtad/tiers');
    const data = await res.json();
    setTiers(data.tiers || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingTier ? `/api/admin/lealtad/tiers/${editingTier.id}` : '/api/admin/lealtad/tiers';
    const method = editingTier ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowForm(false);
      setEditingTier(null);
      resetForm();
      fetchTiers();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este nivel?')) return;
    await fetch(`/api/admin/lealtad/tiers/${id}`, { method: 'DELETE' });
    fetchTiers();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      minPoints: 0,
      minSpent: 0,
      pointsMultiplier: 1,
      discountPercent: 0,
      freeShipping: false,
      prioritySupport: false,
      earlyAccess: false,
      birthdayBonus: 0,
      color: defaultColors[tiers.length] || '#7baaf7',
      sortOrder: tiers.length,
      isActive: true,
    });
  };

  const startEdit = (tier: any) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      minPoints: tier.minPoints,
      minSpent: tier.minSpent,
      pointsMultiplier: tier.pointsMultiplier,
      discountPercent: tier.discountPercent,
      freeShipping: tier.freeShipping,
      prioritySupport: tier.prioritySupport,
      earlyAccess: tier.earlyAccess,
      birthdayBonus: tier.birthdayBonus,
      color: tier.color,
      sortOrder: tier.sortOrder,
      isActive: tier.isActive,
    });
    setShowForm(true);
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
          <h1 className="text-2xl font-bold">Niveles de Lealtad</h1>
        </div>
        <button
          onClick={() => { resetForm(); setEditingTier(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6]"
        >
          <Plus className="w-4 h-4" />
          Nuevo Nivel
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">{editingTier ? 'Editar' : 'Nuevo'} Nivel</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ej: Bronce, Plata, Oro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Puntos Mínimos</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minPoints}
                    onChange={(e) => setFormData({ ...formData, minPoints: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gasto Mínimo ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minSpent}
                    onChange={(e) => setFormData({ ...formData, minSpent: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Multiplicador de Puntos</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.pointsMultiplier}
                    onChange={(e) => setFormData({ ...formData, pointsMultiplier: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descuento Permanente (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bono de Cumpleaños (puntos extra)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.birthdayBonus}
                  onChange={(e) => setFormData({ ...formData, birthdayBonus: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Beneficios</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.freeShipping}
                      onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                      className="rounded"
                    />
                    Envío Gratis
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.prioritySupport}
                      onChange={(e) => setFormData({ ...formData, prioritySupport: e.target.checked })}
                      className="rounded"
                    />
                    Soporte Prioritario
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.earlyAccess}
                      onChange={(e) => setFormData({ ...formData, earlyAccess: e.target.checked })}
                      className="rounded"
                    />
                    Acceso Anticipado
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    Nivel Activo
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6]">
                  {editingTier ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tiers List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`bg-white rounded-xl p-5 shadow-sm border-2 ${!tier.isActive ? 'opacity-60' : ''}`}
            style={{ borderColor: tier.color }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-full" style={{ backgroundColor: tier.color + '20' }}>
                <Star className="w-5 h-5" style={{ color: tier.color }} />
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(tier)} className="p-1.5 hover:bg-gray-100 rounded">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => handleDelete(tier.id)} className="p-1.5 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold" style={{ color: tier.color }}>{tier.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{tier.minPoints.toLocaleString()} puntos</p>
            
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Multiplicador:</span>
                <span className="font-medium">{tier.pointsMultiplier}x</span>
              </div>
              {tier.discountPercent > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Descuento:</span>
                  <span className="font-medium">{tier.discountPercent}%</span>
                </div>
              )}
              {tier.freeShipping && (
                <div className="text-green-600">✓ Envío Gratis</div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t flex items-center gap-2 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-sm">{tier._count?.accounts || 0} miembros</span>
            </div>
          </div>
        ))}
      </div>

      {tiers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay niveles configurados</p>
          <p className="text-sm text-gray-400 mt-1">Crea niveles como Bronce, Plata, Oro, Platino</p>
        </div>
      )}
    </div>
  );
}
