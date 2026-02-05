'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Info } from 'lucide-react';
import Link from 'next/link';

export default function ConfiguracionLealtadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    pointsPerPeso: 1,
    minPurchaseForPoints: 100,
    pointsExpirationDays: 365,
    signupBonus: 100,
    firstPurchaseBonus: 200,
    reviewBonus: 50,
    referralBonus: 300,
    birthdayBonus: 100,
    isActive: true,
  });

  useEffect(() => {
    fetch('/api/admin/lealtad/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/lealtad/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        router.push('/admin/lealtad');
        router.refresh();
      } else {
        alert('Error al guardar configuración');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#7baaf7] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/lealtad" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Configuración del Programa</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Estado */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold mb-4">Estado del Programa</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.isActive}
              onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-[#7baaf7] focus:ring-[#7baaf7]"
            />
            <div>
              <span className="font-medium">Programa Activo</span>
              <p className="text-sm text-gray-500">Los clientes pueden ganar y canjear puntos</p>
            </div>
          </label>
        </div>

        {/* Puntos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <h2 className="font-semibold">Configuración de Puntos</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puntos por Peso Gastado</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={settings.pointsPerPeso}
                onChange={(e) => setSettings({ ...settings, pointsPerPeso: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Ej: 1 punto por cada $1 MXN</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compra Mínima para Puntos</label>
              <input
                type="number"
                min="0"
                value={settings.minPurchaseForPoints}
                onChange={(e) => setSettings({ ...settings, minPurchaseForPoints: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Monto mínimo de compra para ganar puntos</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Días de Expiración</label>
              <input
                type="number"
                min="30"
                value={settings.pointsExpirationDays}
                onChange={(e) => setSettings({ ...settings, pointsExpirationDays: parseInt(e.target.value) || 365 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Días hasta que expiren los puntos</p>
            </div>
          </div>
        </div>

        {/* Bonos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <h2 className="font-semibold">Bonos Especiales</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bono de Registro</label>
              <input
                type="number"
                min="0"
                value={settings.signupBonus}
                onChange={(e) => setSettings({ ...settings, signupBonus: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bono Primera Compra</label>
              <input
                type="number"
                min="0"
                value={settings.firstPurchaseBonus}
                onChange={(e) => setSettings({ ...settings, firstPurchaseBonus: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bono por Reseña</label>
              <input
                type="number"
                min="0"
                value={settings.reviewBonus}
                onChange={(e) => setSettings({ ...settings, reviewBonus: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bono por Referido</label>
              <input
                type="number"
                min="0"
                value={settings.referralBonus}
                onChange={(e) => setSettings({ ...settings, referralBonus: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bono de Cumpleaños</label>
              <input
                type="number"
                min="0"
                value={settings.birthdayBonus}
                onChange={(e) => setSettings({ ...settings, birthdayBonus: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Ejemplo de cálculo:</p>
            <p>Con {settings.pointsPerPeso} punto(s) por peso, una compra de $500 MXN otorga {Math.floor(500 * settings.pointsPerPeso)} puntos.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#7baaf7] text-white rounded-lg hover:bg-[#5a8fe6] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  );
}
