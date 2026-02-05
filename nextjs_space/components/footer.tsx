import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#F7F8FA] border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center text-center mb-10">
          {/* Logo - Much larger and centered */}
          <div className="mb-4">
            <Image
              src="https://static.wixstatic.com/media/84b06e_2e6b4d0f613e4354b58b1eabf225ee9e~mv2.jpg/v1/fill/w_924,h_883,al_c,q_85,enc_avif,quality_auto/84b06e_2e6b4d0f613e4354b58b1eabf225ee9e~mv2.jpg"
              alt="PETCOM"
              width={320}
              height={120}
              className="object-contain"
              priority
            />
          </div>
          
          {/* Tagline - Larger and more visible */}
          <p className="text-lg font-medium text-gray-700 mb-2">
            Tu tienda premium de productos para mascotas
          </p>
          <p className="text-gray-500 max-w-md">
            Todo lo que tu mascota necesita, con la mejor calidad y los mejores precios.
          </p>
        </div>

        {/* Social Media Icons - Larger */}
        <div className="flex justify-center gap-4 mb-10">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-[#7baaf7] hover:shadow-md transition-all"
            aria-label="Facebook"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-[#e67c73] hover:shadow-md transition-all"
            aria-label="Instagram"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="https://cdn-icons-png.flaticon.com/512/124/124021.png"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-[#7baaf7] hover:shadow-md transition-all"
            aria-label="Twitter"
          >
            <Twitter className="w-6 h-6" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:shadow-md transition-all"
            aria-label="YouTube"
          >
            <Youtube className="w-6 h-6" />
          </a>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-10">
          {/* Tienda */}
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-4">Tienda</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/catalogo" className="text-gray-600 hover:text-[#7baaf7] transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/catalogo?category=perros" className="text-gray-600 hover:text-[#7baaf7] transition-colors">
                  Perros
                </Link>
              </li>
              <li>
                <Link href="/catalogo?category=gatos" className="text-gray-600 hover:text-[#7baaf7] transition-colors">
                  Gatos
                </Link>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-4">Información</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/politica-envios" className="text-gray-600 hover:text-[#7baaf7] transition-colors">
                  Política de Envíos
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="text-gray-600 hover:text-[#7baaf7] transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-gray-600 hover:text-[#7baaf7] transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-center justify-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                hola@petcom.mx
              </li>
              <li className="flex items-center justify-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                +52 55 1234 5678
              </li>
              <li className="flex items-center justify-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                CDMX, México
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} PETCOM. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/terminos-condiciones" className="hover:text-[#7baaf7] transition-colors">
                Términos
              </Link>
              <Link href="/aviso-privacidad" className="hover:text-[#7baaf7] transition-colors">
                Privacidad
              </Link>
            </div>
          </div>
          <p className="text-center text-gray-400 text-xs mt-3">
            Hecho con ❤️ para tu mascota
          </p>
        </div>
      </div>
    </footer>
  );
}