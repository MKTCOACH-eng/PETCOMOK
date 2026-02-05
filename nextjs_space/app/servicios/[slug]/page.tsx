'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Phone, Mail, Globe, Clock, MessageCircle, Send, ArrowLeft, Check, Instagram, Facebook, Stethoscope, Scissors, GraduationCap, Home as HomeIcon, Dog } from 'lucide-react';

const serviceCategoryIcons: Record<string, React.ReactNode> = {
  veterinarios: <Stethoscope className="w-6 h-6" />,
  esteticas: <Scissors className="w-6 h-6" />,
  entrenadores: <GraduationCap className="w-6 h-6" />,
  hospedaje: <HomeIcon className="w-6 h-6" />,
  paseadores: <Dog className="w-6 h-6" />,
};

interface ServiceProvider {
  id: string;
  businessName: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  images: string[];
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  serviceArea: string | null;
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  averageRating: number;
  totalReviews: number;
  services: any[];
  schedule: any;
  category: {
    name: string;
    slug: string;
  };
  reviews: any[];
}

export default function ProviderDetailPage({ params }: { params: { slug: string } }) {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    petType: '',
    petName: '',
    serviceInterest: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchProvider() {
      try {
        const res = await fetch(`/api/services/providers/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setProvider(data);
        }
      } catch (error) {
        console.error('Error fetching provider:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProvider();
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/services/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          ...formData
        })
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7baaf7] border-t-transparent"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proveedor no encontrado</h1>
          <Link href="/servicios" className="text-[#7baaf7] hover:underline">Volver a servicios</Link>
        </div>
      </div>
    );
  }

  const services = Array.isArray(provider.services) ? provider.services : [];

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header/Cover */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-[#7baaf7] to-[#ba67c8]">
        {provider.coverImageUrl && (
          <Image src={provider.coverImageUrl} alt={provider.businessName} fill className="object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-[1200px] mx-auto">
            <Link href="/servicios" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4" /> Volver a servicios
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 -mt-20 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#7baaf7]/20 to-[#ba67c8]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {provider.logoUrl ? (
                    <Image src={provider.logoUrl} alt={provider.businessName} width={80} height={80} className="object-cover" />
                  ) : (
                    serviceCategoryIcons[provider.category.slug] || <Stethoscope className="w-10 h-10 text-[#7baaf7]" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="inline-block px-2 py-1 bg-[#7baaf7]/10 text-[#7baaf7] text-xs font-medium rounded-full mb-2">
                    {provider.category.name}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{provider.businessName}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-500 fill-current" />
                      <span className="font-bold text-gray-900">{provider.averageRating.toFixed(1)}</span>
                      <span className="text-gray-500">({provider.totalReviews} reseñas)</span>
                    </div>
                    {provider.city && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.city}, {provider.state}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{provider.description}</p>

              {/* Services */}
              {services.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-bold text-gray-900 mb-4">Servicios Ofrecidos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.map((service: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          {service.duration && <p className="text-xs text-gray-500">{service.duration}</p>}
                        </div>
                        {service.price && (
                          <span className="font-bold text-[#7baaf7]">${service.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            {provider.reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Reseñas de Clientes</h3>
                <div className="space-y-4">
                  {provider.reviews.map((review: any) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="font-medium text-gray-900">{review.authorName}</span>
                      </div>
                      {review.title && <p className="font-medium text-gray-900 mb-1">{review.title}</p>}
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Contact */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Información de Contacto</h3>
              
              <div className="space-y-3 mb-6">
                {provider.phone && (
                  <a href={`tel:${provider.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-[#7baaf7]">
                    <Phone className="w-5 h-5" />
                    <span>{provider.phone}</span>
                  </a>
                )}
                {provider.whatsapp && (
                  <a href={`https://wa.me/${provider.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-green-600">
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {provider.email && (
                  <a href={`mailto:${provider.email}`} className="flex items-center gap-3 text-gray-700 hover:text-[#7baaf7]">
                    <Mail className="w-5 h-5" />
                    <span>{provider.email}</span>
                  </a>
                )}
                {provider.website && (
                  <a href={provider.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-[#7baaf7]">
                    <Globe className="w-5 h-5" />
                    <span>Sitio web</span>
                  </a>
                )}
                {provider.address && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span>{provider.address}, {provider.city}, {provider.state} {provider.zipCode}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(provider.facebook || provider.instagram) && (
                <div className="flex gap-3 mb-6 pb-6 border-b">
                  {provider.facebook && (
                    <a href={provider.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {provider.instagram && (
                    <a href={provider.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}

              {/* Contact Form */}
              {!submitted ? (
                <>
                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full py-3 bg-[#7baaf7] text-white font-medium rounded-lg hover:bg-[#6a9be6] transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Solicitar Información
                  </button>

                  {showContactForm && (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                      <input
                        type="text"
                        placeholder="Tu nombre *"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      />
                      <input
                        type="email"
                        placeholder="Tu email *"
                        required
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      />
                      <input
                        type="tel"
                        placeholder="Tu teléfono"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Tipo mascota"
                          value={formData.petType}
                          onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Nombre mascota"
                          value={formData.petName}
                          onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                        />
                      </div>
                      <textarea
                        placeholder="¿En qué podemos ayudarte?"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-[#41b375] text-white font-medium rounded-lg hover:bg-[#38a066] transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900">¡Solicitud enviada!</p>
                  <p className="text-sm text-gray-600">El proveedor te contactará pronto</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
