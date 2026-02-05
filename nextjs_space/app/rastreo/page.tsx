'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Truck } from 'lucide-react';

export default function RastreoPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/rastreo/${trackingNumber.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#F7F8FA] flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#7baaf7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck className="w-10 h-10 text-[#7baaf7]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Rastrea tu Pedido</h1>
          <p className="text-gray-600">
            Ingresa tu número de guía para ver el estado de tu envío
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="relative">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              placeholder="Ej: FEDEX1234567MX"
              className="w-full px-4 py-4 pr-14 text-lg border border-gray-200 rounded-xl focus:border-[#7baaf7] focus:outline-none focus:ring-2 focus:ring-[#7baaf7]/20 transition-all font-mono"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4 text-center">
            El número de guía se encuentra en tu correo de confirmación
          </p>
        </form>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#7baaf7]" />
            Estados de Envío
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-gray-700">Guía Generada - Tu paquete está listo para ser recolectado</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="text-gray-700">Recolectado - El paquete fue recogido por la paquetería</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-gray-700">En Tránsito - Tu paquete está en camino</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-gray-700">En Camino - El repartidor va hacia tu domicilio</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-700">Entregado - ¡Tu paquete fue entregado!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
