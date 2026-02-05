'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, MapPin, Clock, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  description: string;
  location: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  carrierName: string;
  status: string;
  statusLabel: string;
  estimatedDelivery: string;
  events: TrackingEvent[];
}

const statusColors: Record<string, string> = {
  created: 'bg-blue-500',
  picked_up: 'bg-indigo-500',
  in_transit: 'bg-yellow-500',
  out_for_delivery: 'bg-orange-500',
  delivered: 'bg-green-500',
  exception: 'bg-red-500',
  returned: 'bg-purple-500',
};

const statusBgColors: Record<string, string> = {
  created: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-yellow-100 text-yellow-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  exception: 'bg-red-100 text-red-800',
  returned: 'bg-purple-100 text-purple-800',
};

export default function TrackingDetailPage({ params }: { params: { tracking: string } }) {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracking = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await fetch(`/api/shipping/track/${params.tracking}`);
      const data = await response.json();
      
      if (data.success) {
        setTracking(data.tracking);
        setError('');
      } else {
        setError(data.error || 'No se encontró información de rastreo');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [params.tracking]);

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7baaf7] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Buscando información de rastreo...</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-[80vh] bg-[#F7F8FA] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'No se encontró información para este número de rastreo'}</p>
          <Link
            href="/rastreo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Intentar de nuevo
          </Link>
        </div>
      </div>
    );
  }

  const isDelivered = tracking.status === 'delivered';

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/rastreo"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Nueva búsqueda
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Número de Rastreo</p>
              <h1 className="text-2xl font-mono font-bold text-gray-900">{tracking.trackingNumber}</h1>
            </div>
            <button
              onClick={() => fetchTracking(true)}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Actualizar"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">{tracking.carrierName}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBgColors[tracking.status] || 'bg-gray-100 text-gray-800'}`}>
              {tracking.statusLabel}
            </span>
          </div>

          {/* Estimated delivery */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {isDelivered ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <Clock className="w-8 h-8 text-[#7baaf7]" />
              )}
              <div>
                <p className="text-sm text-gray-500">
                  {isDelivered ? 'Entregado' : 'Entrega estimada'}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {tracking.estimatedDelivery}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#7baaf7]" />
            Historial de Movimientos
          </h2>

          <div className="relative">
            {tracking.events.map((event, index) => (
              <div key={index} className="flex gap-4 pb-8 last:pb-0">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${statusColors[event.status] || 'bg-gray-300'}`}></div>
                  {index < tracking.events.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 -mt-1">
                  <p className="font-medium text-gray-900">{event.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {event.date} · {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">¿Necesitas ayuda?</h2>
          <p className="text-gray-600 mb-4">
            Si tienes alguna pregunta sobre tu envío, contáctanos y te ayudaremos.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:hola@petcom.mx"
              className="px-4 py-2 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-medium transition-colors"
            >
              Contactar Soporte
            </a>
            <Link
              href="/preguntas-frecuentes"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Preguntas Frecuentes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
