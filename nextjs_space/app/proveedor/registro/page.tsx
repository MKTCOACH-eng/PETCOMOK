'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight, AlertCircle, Check, Building, User, Mail, Phone, MapPin, Briefcase, CreditCard, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProviderRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Business Info
    businessName: '',
    categoryId: '',
    description: '',
    shortDescription: '',
    logoUrl: '',
    
    // Step 2: Contact Info
    contactName: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    
    // Step 3: Location
    address: '',
    city: '',
    state: '',
    zipCode: '',
    serviceArea: '',
    
    // Step 4: Services (simplified)
    services: [] as any[]
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/services/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // Obtener URL presignada
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          isPublic: true
        })
      });

      if (!presignedRes.ok) throw new Error('Error al obtener URL de subida');

      const { uploadUrl, cloud_storage_path } = await presignedRes.json();

      // Detectar si content-disposition está en los headers firmados
      const urlObj = new URL(uploadUrl);
      const signedHeaders = urlObj.searchParams.get('X-Amz-SignedHeaders') || '';
      const needsContentDisposition = signedHeaders.includes('content-disposition');

      // Subir directamente a S3
      const headers: Record<string, string> = {
        'Content-Type': file.type
      };
      if (needsContentDisposition) {
        headers['Content-Disposition'] = 'attachment';
      }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: file
      });

      if (!uploadRes.ok) throw new Error('Error al subir imagen');

      // La URL pública es simplemente el uploadUrl sin los parámetros de query
      const publicUrl = uploadUrl.split('?')[0];
      
      setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logoUrl: '' });
  };

  const validateStep = (currentStep: number) => {
    setError('');
    
    if (currentStep === 1) {
      if (!formData.businessName || !formData.categoryId || !formData.description) {
        setError('Por favor completa todos los campos obligatorios');
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.contactName || !formData.email || !formData.phone || !formData.password) {
        setError('Por favor completa todos los campos obligatorios');
        return false;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.city || !formData.state) {
        setError('Por favor indica al menos tu ciudad y estado');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/services/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al registrar');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7baaf7] to-[#ba67c8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">¡Registro Exitoso!</h1>
          <p className="text-gray-600 mb-6">
            Tu solicitud ha sido recibida. Nuestro equipo revisará tu información y te contactará para activar tu membresía de <strong>$299/mes</strong>.
          </p>
          <div className="space-y-3">
            <Link
              href="/proveedor/login"
              className="block w-full py-3 bg-[#7baaf7] text-white font-medium rounded-lg hover:bg-[#6a9be6] transition-colors"
            >
              Ir al Login
            </Link>
            <Link
              href="/"
              className="block w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7baaf7] to-[#ba67c8] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo-petcom.png" alt="PETCOM" width={150} height={50} className="mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Registro de Proveedor</h1>
          <p className="text-white/80 mt-2">Comienza a recibir clientes por solo $299/mes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-white text-[#7baaf7]' : 'bg-white/30 text-white'
                }`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 && <div className={`w-8 h-1 ${step > s ? 'bg-white' : 'bg-white/30'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Business Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <Building className="w-6 h-6 text-[#7baaf7]" />
                  <h2 className="text-xl font-bold text-gray-900">Información del Negocio</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio *</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                    placeholder="Ej: Veterinaria San Marcos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría de Servicio *</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Corta</label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    maxLength={150}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                    placeholder="Breve descripción para la vista previa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Completa *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                    placeholder="Describe tus servicios, experiencia, especializaciones..."
                  />
                </div>

                {/* Logo/Foto Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo o Foto del Negocio</label>
                  {formData.logoUrl ? (
                    <div className="relative">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-[#7baaf7] bg-gray-50">
                        <Image
                          src={formData.logoUrl}
                          alt="Logo del negocio"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="logo-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          uploading 
                            ? 'border-gray-300 bg-gray-50' 
                            : 'border-gray-300 hover:border-[#7baaf7] hover:bg-[#7baaf7]/5'
                        }`}
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-[#7baaf7] animate-spin mb-2" />
                            <span className="text-sm text-gray-500">Subiendo...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Clic para subir imagen</span>
                            <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (máx 5MB)</span>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-[#7baaf7]" />
                  <h2 className="text-xl font-bold text-gray-900">Datos de Contacto</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Contacto *</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      placeholder="55 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (opcional)</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                    placeholder="55 1234 5678"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent pr-12"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-[#7baaf7]" />
                  <h2 className="text-xl font-bold text-gray-900">Ubicación</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                    placeholder="Calle, número, colonia"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      placeholder="Ej: CDMX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      placeholder="Ej: Ciudad de México"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      placeholder="Ej: 06600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área de Servicio</label>
                    <input
                      type="text"
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      placeholder="Ej: CDMX y Zona Metropolitana"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-[#7baaf7]" />
                  <h2 className="text-xl font-bold text-gray-900">Confirmar Registro</h2>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Resumen de tu registro:</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Negocio:</dt>
                      <dd className="font-medium text-gray-900">{formData.businessName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Contacto:</dt>
                      <dd className="font-medium text-gray-900">{formData.contactName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Email:</dt>
                      <dd className="font-medium text-gray-900">{formData.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Ubicación:</dt>
                      <dd className="font-medium text-gray-900">{formData.city}, {formData.state}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gradient-to-r from-[#7baaf7]/10 to-[#ba67c8]/10 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">Membresía PETCOM</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Al registrarte, tu cuenta quedará pendiente de aprobación. Una vez aprobada, podrás activar tu membresía.
                  </p>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <p className="font-bold text-gray-900">Plan Mensual</p>
                      <p className="text-sm text-gray-600">Acceso completo al directorio</p>
                    </div>
                    <p className="text-2xl font-bold text-[#7baaf7]">$299<span className="text-sm text-gray-500">/mes</span></p>
                  </div>
                </div>

                <label className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1" />
                  <span className="text-sm text-gray-600">
                    Acepto los <Link href="/terminos-condiciones" className="text-[#7baaf7] hover:underline">Términos y Condiciones</Link> y el <Link href="/aviso-privacidad" className="text-[#7baaf7] hover:underline">Aviso de Privacidad</Link>
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Anterior
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-[#7baaf7] text-white font-medium rounded-lg hover:bg-[#6a9be6] transition-colors flex items-center gap-2"
                >
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#41b375] text-white font-medium rounded-lg hover:bg-[#38a066] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Completar Registro
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/proveedor/login" className="text-[#7baaf7] hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
