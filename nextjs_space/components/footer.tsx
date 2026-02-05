'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Mail, Phone, MapPin, Truck, ShieldCheck, Heart, Send, CheckCircle } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al suscribirse');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión');
    }

    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 4000);
  };

  return (
    <footer className="bg-[#F7F8FA] border-t border-gray-200">
      {/* Newsletter Banner */}
      <div className="bg-gradient-to-r from-[#7baaf7] to-[#5a8fe6]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white text-center md:text-left">
              <h3 className="font-bold text-lg">🐾 Únete a nuestra manada</h3>
              <p className="text-white/80 text-sm">Recibe ofertas exclusivas y tips para tu mascota</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-64">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2.5 rounded-lg text-sm bg-white/95 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                  disabled={status === 'loading'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="px-5 py-2.5 bg-[#e67c73] hover:bg-[#d56a62] text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Suscribirse</span>
              </button>
            </form>
          </div>
          {message && (
            <p className={`text-center text-sm mt-2 ${status === 'success' ? 'text-white' : 'text-red-200'}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8">
          
          {/* Logo & Social */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logo-petcom.png"
              alt="PETCOM"
              width={140}
              height={60}
              className="object-contain mb-3"
            />
            <div className="flex gap-2 mt-3">
              <a href="https://facebook.com/petcom" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#1877F2] hover:border-[#1877F2] transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/petcom" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#E4405F] hover:border-[#E4405F] transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://tiktok.com/@petcom" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wide">Tienda</h4>
            <ul className="space-y-1.5">
              <li><Link href="/catalogo" className="text-gray-600 hover:text-[#7baaf7] text-sm">Catálogo</Link></li>
              <li><Link href="/catalogo?category=perros" className="text-gray-600 hover:text-[#7baaf7] text-sm">Perros</Link></li>
              <li><Link href="/catalogo?category=gatos" className="text-gray-600 hover:text-[#7baaf7] text-sm">Gatos</Link></li>
              <li><Link href="/catalogo?category=mascotas-pequenas" className="text-gray-600 hover:text-[#7baaf7] text-sm">Mascotas Pequeñas</Link></li>
              <li><Link href="/catalogo?category=aves" className="text-gray-600 hover:text-[#7baaf7] text-sm">Aves</Link></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wide">Ayuda</h4>
            <ul className="space-y-1.5">
              <li><Link href="/rastreo" className="text-gray-600 hover:text-[#7baaf7] text-sm">Rastrear Pedido</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-[#7baaf7] text-sm">Blog & Tips</Link></li>
              <li><Link href="/preguntas-frecuentes" className="text-gray-600 hover:text-[#7baaf7] text-sm">FAQ</Link></li>
              <li><Link href="/politica-envios" className="text-gray-600 hover:text-[#7baaf7] text-sm">Envíos</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wide">Legal</h4>
            <ul className="space-y-1.5">
              <li><Link href="/terminos-condiciones" className="text-gray-600 hover:text-[#7baaf7] text-sm">Términos</Link></li>
              <li><Link href="/aviso-privacidad" className="text-gray-600 hover:text-[#7baaf7] text-sm">Privacidad</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wide">Contacto</h4>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#7baaf7]" />
                <a href="mailto:hola@petcom.mx" className="hover:text-[#7baaf7]">hola@petcom.mx</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#7baaf7]" />
                <a href="tel:+525512345678" className="hover:text-[#7baaf7]">55 1234 5678</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#7baaf7]" />
                <span>CDMX, MX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-6 pt-5 border-t border-gray-200 flex flex-wrap justify-center gap-6 text-gray-500 text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7baaf7]" />
            <span>Pago Seguro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#7baaf7]" />
            <span>Envío gratis +$799</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-[#e67c73]" />
            <span>+500 productos</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900 py-3">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs">
          <p className="text-gray-400">© 2026 PETCOM. Todos los derechos reservados.</p>
          <p className="text-gray-500 flex items-center gap-1">
            Hecho con <Heart className="w-3 h-3 text-[#e67c73] fill-[#e67c73]" /> para tu mascota
          </p>
        </div>
      </div>
    </footer>
  );
}