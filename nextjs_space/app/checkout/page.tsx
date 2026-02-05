'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import Image from 'next/image';
import { User, MapPin, Phone, Mail, CreditCard, AlertCircle, Lock, Truck, Package, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShippingRate {
  id: string;
  carrier: string;
  carrierName: string;
  carrierLogo: string;
  serviceType: string;
  serviceName: string;
  deliveryDays: number;
  estimatedDelivery: string;
  price: number;
  currency: string;
  zone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Shipping rates state
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Fetch shipping rates when zip code changes
  useEffect(() => {
    const fetchRates = async () => {
      if (formData.zipCode.length === 5) {
        setLoadingRates(true);
        setRatesError('');
        setSelectedRate(null);
        
        try {
          const response = await fetch('/api/shipping/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              zipCode: formData.zipCode,
              weight: 2, // Default weight in kg
              declaredValue: totalPrice,
            }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            setShippingRates(data.rates);
            // Auto-select cheapest option
            if (data.rates.length > 0) {
              setSelectedRate(data.rates[0]);
            }
          } else {
            setRatesError(data.error || 'Error al obtener cotizaciones');
          }
        } catch (err) {
          setRatesError('Error de conexión');
        } finally {
          setLoadingRates(false);
        }
      } else {
        setShippingRates([]);
        setSelectedRate(null);
      }
    };

    const debounce = setTimeout(fetchRates, 500);
    return () => clearTimeout(debounce);
  }, [formData.zipCode, totalPrice]);

  // Calculate totals
  const shippingCost = selectedRate?.price || 0;
  const finalTotal = totalPrice + shippingCost;

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7baaf7]"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F8FA]">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm">
          <Lock className="w-16 h-16 text-[#7baaf7] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión para continuar</h1>
          <p className="text-gray-600 mb-6">Necesitas una cuenta para completar tu compra</p>
          <Link
            href="/auth/login?callbackUrl=/checkout"
            className="inline-block w-full py-3 bg-[#7baaf7] text-white font-semibold rounded-lg hover:bg-[#6999e6] transition-colors"
          >
            Iniciar Sesión
          </Link>
          <p className="mt-4 text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/registro?callbackUrl=/checkout" className="text-[#7baaf7] font-medium hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    router.push('/carrito');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRate) {
      setError('Por favor selecciona un método de envío');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingData: formData,
          shippingRate: selectedRate,
          total: finalTotal,
          shippingCost: shippingCost,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Error al procesar el pedido');
      }

      const order = await response.json();
      clearCart();
      router.push(`/pedidos/${order.id}/confirmacion`);
    } catch (err: any) {
      setError(err?.message || 'Error al procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#7baaf7]" />
                  Información de Contacto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#7baaf7] focus:outline-none transition-colors"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#7baaf7] focus:outline-none transition-colors"
                      placeholder="juan@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#7baaf7] focus:outline-none transition-colors"
                      placeholder="55 1234 5678"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#7baaf7]" />
                  Dirección de Envío
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#7baaf7] focus:outline-none transition-colors"
                      placeholder="Calle, número, colonia"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#7baaf7] focus:outline-none transition-colors"
                        placeholder="CDMX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#7baaf7] focus:outline-none transition-colors"
                        placeholder="CDMX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">C.P.</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        maxLength={5}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#7baaf7] focus:outline-none transition-colors"
                        placeholder="01234"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#7baaf7]" />
                  Método de Envío
                </h2>
                
                {formData.zipCode.length < 5 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Ingresa tu código postal para ver las opciones de envío</p>
                  </div>
                ) : loadingRates ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 text-[#7baaf7] animate-spin" />
                    <p className="text-gray-600">Cotizando envíos...</p>
                  </div>
                ) : ratesError ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                    <p>{ratesError}</p>
                  </div>
                ) : shippingRates.length > 0 ? (
                  <div className="space-y-3">
                    {shippingRates.slice(0, 6).map((rate) => (
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
                          name="shippingRate"
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
                            <span>{rate.deliveryDays === 1 ? 'Mañana' : `${rate.deliveryDays} días`}</span>
                            <span className="text-gray-300">|</span>
                            <span>{rate.estimatedDelivery}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            ${rate.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </label>
                    ))}
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                      Powered by <span className="font-semibold">envia.com</span> · Cotización en tiempo real
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay opciones de envío disponibles</p>
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>

                {/* Items Preview */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    {selectedRate ? (
                      <span>${shippingCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    ) : (
                      <span className="text-gray-400">Por calcular</span>
                    )}
                  </div>
                  {selectedRate && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {selectedRate.carrierName} - {selectedRate.serviceName}
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>${finalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedRate}
                  className="mt-6 w-full py-3 bg-[#7baaf7] hover:bg-[#6999e6] text-white font-semibold rounded-lg transition-colors shadow-lg shadow-[#7baaf7]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Confirmar Pedido
                    </>
                  )}
                </button>

                {!selectedRate && formData.zipCode.length === 5 && !loadingRates && (
                  <p className="mt-2 text-xs text-center text-amber-600">
                    Selecciona un método de envío para continuar
                  </p>
                )}

                <p className="mt-4 text-xs text-center text-gray-500">
                  Al confirmar, aceptas procesar tu pedido. El pago se habilitará próximamente.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
