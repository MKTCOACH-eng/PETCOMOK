import Link from 'next/link';
import Image from 'next/image';
import { Heart, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#F7F8FA] border-t border-gray-200">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Logo grande centrado arriba */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-64 h-24 mb-4">
            <Image
              src="https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/LOGO/petcom.png"
              alt="Petcom"
              fill
              className="object-contain"
              sizes="256px"
            />
          </div>
          <p className="text-gray-600 text-center max-w-md">
            El hogar de quienes aman a sus mascotas. Productos seleccionados con cariño para el bienestar de tu compañero.
          </p>
          {/* Redes Sociales */}
          <div className="flex items-center gap-3 mt-5">
            <a
              href="https://facebook.com/petcom"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white border border-gray-200 hover:bg-[#7baaf7] hover:border-[#7baaf7] rounded-full flex items-center justify-center transition-all group shadow-sm"
            >
              <Facebook className="w-5 h-5 text-gray-600 group-hover:text-white" />
            </a>
            <a
              href="https://instagram.com/petcom"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white border border-gray-200 hover:bg-[#e67c73] hover:border-[#e67c73] rounded-full flex items-center justify-center transition-all group shadow-sm"
            >
              <Instagram className="w-5 h-5 text-gray-600 group-hover:text-white" />
            </a>
            <a
              href="https://twitter.com/petcom"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white border border-gray-200 hover:bg-[#7baaf7] hover:border-[#7baaf7] rounded-full flex items-center justify-center transition-all group shadow-sm"
            >
              <Twitter className="w-5 h-5 text-gray-600 group-hover:text-white" />
            </a>
            <a
              href="https://youtube.com/petcom"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white border border-gray-200 hover:bg-[#e67c73] hover:border-[#e67c73] rounded-full flex items-center justify-center transition-all group shadow-sm"
            >
              <Youtube className="w-5 h-5 text-gray-600 group-hover:text-white" />
            </a>
          </div>
        </div>

        {/* Links en 3 columnas centradas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-center sm:text-left">
          {/* Tienda */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Tienda</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/catalogo" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Todos los Productos
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
                <Link href="/catalogo?category=mascotas-pequenas" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Mascotas Pequeñas
                </Link>
              </li>
              <li>
                <Link href="/catalogo?category=aves" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Aves
                </Link>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Información</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/politica-envios" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Política de Envíos
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/aviso-privacidad" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Aviso de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos-condiciones" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center sm:items-start gap-2 text-sm text-gray-600 justify-center sm:justify-start">
                <Mail className="w-4 h-4 text-[#7baaf7] flex-shrink-0" />
                <span>hola@petcom.mx</span>
              </li>
              <li className="flex items-center sm:items-start gap-2 text-sm text-gray-600 justify-center sm:justify-start">
                <Phone className="w-4 h-4 text-[#7baaf7] flex-shrink-0" />
                <span>+52 (55) 1234-5678</span>
              </li>
              <li className="flex items-center sm:items-start gap-2 text-sm text-gray-600 justify-center sm:justify-start">
                <MapPin className="w-4 h-4 text-[#7baaf7] flex-shrink-0" />
                <span>CDMX, México</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              Lun-Vie: 9am - 6pm
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 mt-10 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Hecho con <Heart className="w-4 h-4 text-[#e67c73] fill-current" /> para las mascotas de México
            </p>
            <span className="hidden sm:inline text-gray-300">|</span>
            <p className="text-gray-400 text-xs">
              © 2026 PETCOM. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
