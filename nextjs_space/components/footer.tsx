import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Mail, Phone, MapPin, HelpCircle, Truck, RefreshCw, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#F7F8FA] to-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Logo & About - 4 cols */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <Image
              src="/logo-petcom.png"
              alt="PETCOM - Everything for your pet"
              width={220}
              height={100}
              className="object-contain mb-6"
              priority
            />
            <p className="text-gray-600 text-center lg:text-left leading-relaxed mb-6">
              Todo lo que tu mascota necesita, con la mejor calidad y los mejores precios. Más de 500 productos premium para consentir a tu mejor amigo.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com/petcom"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#1877F2] hover:border-[#1877F2] hover:shadow-md transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/petcom"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#E4405F] hover:border-[#E4405F] hover:shadow-md transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/@petcom"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:border-black hover:shadow-md transition-all"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Sections - 8 cols */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Tienda */}
            <div>
              <h4 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">Tienda</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/catalogo" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                    Ver Catálogo
                  </Link>
                </li>
                <li>
                  <Link href="/catalogo?category=perros" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                    Perros
                  </Link>
                </li>
                <li>
                  <Link href="/catalogo?category=gatos" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                    Gatos
                  </Link>
                </li>
                <li>
                  <Link href="/catalogo?category=accesorios" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                    Accesorios
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ayuda */}
            <div>
              <h4 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">Ayuda</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/preguntas-frecuentes" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/politica-envios" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Envíos
                  </Link>
                </li>
                <li>
                  <Link href="/devoluciones" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Devoluciones
                  </Link>
                </li>
                <li>
                  <Link href="/mis-mascotas" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Mis Mascotas
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/terminos-condiciones" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/aviso-privacidad" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                    Aviso de Privacidad
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">Contacto</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:hola@petcom.mx" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    hola@petcom.mx
                  </a>
                </li>
                <li>
                  <a href="tel:+525512345678" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    +52 55 1234 5678
                  </a>
                </li>
                <li className="text-gray-600 text-sm flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>CDMX, México<br />Lun-Vie: 9am-6pm</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#7baaf7]" />
              <span>Pago 100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#7baaf7]" />
              <span>Envío gratis +$799</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#7baaf7]" />
              <span>30 días de devolución</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
            <p className="text-gray-400">
              © 2026 PETCOM. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-xs flex items-center gap-1">
              Hecho con <Heart className="w-3 h-3 text-[#e67c73] fill-[#e67c73]" /> para tu mascota
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}