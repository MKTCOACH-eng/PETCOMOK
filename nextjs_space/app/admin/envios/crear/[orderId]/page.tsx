'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, MapPin, Clock, Loader2, CheckCircle, AlertCircle, Printer } from 'lucide-react';

interface ShippingRate {
  id: string;
  carrier: string;
  carrierName: string;
  serviceType: string;
  serviceName: string;
  deliveryDays: number;
  estimatedDelivery: string;
  price: number;
  zone: string;
}

interface Order {
  id: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingPhone: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      weight: number | null;
    };
  }[];
}

export default function CrearEnvioPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRates, setLoadingRates] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ trackingNumber: string; labelUrl: string } | null>(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/pedidos/${params.orderId}`);
        if (!response.ok) throw new Error('Pedido no encontrado');
        const data = await response.json();
        setOrder(data);
        
        // Auto-fetch rates if we have zip code
        if (data.shippingZipCode) {
          fetchRates(data.shippingZipCode);
        }
      } catch (err) {
        setError('Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.orderId]);

  const fetchRates = async (zipCode: string) => {
    setLoadingRates(true);
    try {
      const response = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipCode,
          weight: order ? order.items.reduce((sum, item) => sum + ((item.product.weight || 500) / 1000) * item.quantity, 0) : 2,
          declaredValue: order?.total || 500,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setRates(data.rates);
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
    } finally {
      setLoadingRates(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!selectedRate || !order) return;
    
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/shipping/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          rateId: selectedRate.id,
          carrier: selectedRate.carrierName,
          serviceName: selectedRate.serviceName,
          serviceType: selectedRate.serviceType,
          shippingCost: selectedRate.price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear envío');
      }

      setSuccess({
        trackingNumber: data.trackingNumber,
        labelUrl: data.labelUrl,
      });
    } catch (err: any) {
      setError(err.message || 'Error al crear el envío');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#7baaf7] animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600">Pedido no encontrado</p>
        <Link href="/admin/envios" className="text-[#7baaf7] hover:underline mt-2 inline-block">
          Volver a envíos
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Guía Generada!</h1>
          <p className="text-gray-600 mb-6">El envío ha sido creado exitosamente</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">Número de Rastreo</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{success.trackingNumber}</p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <a
              href={success.labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Imprimir Etiqueta
            </a>
            <Link
              href="/admin/envios"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Volver a Envíos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/envios"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Envíos
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#7baaf7]/10 rounded-lg">
          <Truck className="w-6 h-6 text-[#7baaf7]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generar Guía de Envío</h1>
          <p className="text-gray-600">Pedido #{order.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#7baaf7]" />
              Detalles del Pedido
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Destinatario</p>
                <p className="font-medium text-gray-900">{order.shippingName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Dirección
                </p>
                <p className="text-gray-900">{order.shippingAddress}</p>
                <p className="text-gray-600">
                  {order.shippingCity}, {order.shippingState} {order.shippingZipCode}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-gray-900">{order.shippingPhone}</p>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">Productos</p>
                <div className="space-y-2 mt-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.product.name} x{item.quantity}</span>
                      <span className="text-gray-500">{item.product.weight ? `${item.product.weight}g` : '500g'}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total del Pedido</span>
                  <span className="font-bold text-gray-900">
                    ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Options */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#7baaf7]" />
              Selecciona el Carrier
            </h2>

            {loadingRates ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 mx-auto text-[#7baaf7] animate-spin mb-3" />
                <p className="text-gray-600">Cotizando opciones de envío...</p>
              </div>
            ) : rates.length > 0 ? (
              <div className="space-y-3">
                {rates.map((rate) => (
                  <label
                    key={rate.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedRate?.id === rate.id
                        ? 'border-[#7baaf7] bg-[#7baaf7]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="carrier"
                      value={rate.id}
                      checked={selectedRate?.id === rate.id}
                      onChange={() => setSelectedRate(rate)}
                      className="w-5 h-5 text-[#7baaf7] border-gray-300 focus:ring-[#7baaf7]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{rate.carrierName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          rate.serviceType === 'express' ? 'bg-red-100 text-red-700' :
                          rate.serviceType === 'standard' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {rate.serviceName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{rate.deliveryDays === 1 ? 'Entrega mañana' : `${rate.deliveryDays} días hábiles`}</span>
                        <span className="text-gray-300">|</span>
                        <span>{rate.estimatedDelivery}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-gray-900">
                        ${rate.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <p className="text-xs text-gray-500">{rate.zone}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron opciones de envío</p>
                <button
                  onClick={() => order.shippingZipCode && fetchRates(order.shippingZipCode)}
                  className="mt-4 text-[#7baaf7] hover:underline"
                >
                  Reintentar
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {selectedRate && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Costo del envío</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${selectedRate.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button
                    onClick={handleCreateShipment}
                    disabled={creating}
                    className="px-6 py-3 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Printer className="w-5 h-5" />
                        Generar Guía
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Powered by <span className="font-semibold">envia.com</span> · La guía se generará automáticamente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
