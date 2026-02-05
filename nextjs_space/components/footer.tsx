import Link from 'next/link';
import Image from 'next/image';
import { Heart, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#F7F8FA] border-t border-gray-200">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="relative w-48 h-20 mb-6">
              <Image
                src="https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/LOGO/petcom.png"
                alt="Petcom"
                fill
                className="object-contain object-left"
                sizes="192px"
              />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              El hogar de quienes aman a sus mascotas. Productos seleccionados con cariño para el bienestar de tu compañero.
            </p>
            {/* Redes Sociales */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com/petcom"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-200 hover:bg-[#7baaf7] rounded-full flex items-center justify-center transition-colors group"
              >
                <Facebook className="w-4 h-4 text-gray-600 group-hover:text-white" />
              </a>
              <a
                href="https://instagram.com/petcom"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-200 hover:bg-[#e67c73] rounded-full flex items-center justify-center transition-colors group"
              >
                <Instagram className="w-4 h-4 text-gray-600 group-hover:text-white" />
              </a>
              <a
                href="https://twitter.com/petcom"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-200 hover:bg-[#7baaf7] rounded-full flex items-center justify-center transition-colors group"
              >
                <Twitter className="w-4 h-4 text-gray-600 group-hover:text-white" />
              </a>
              <a
                href="https://youtube.com/petcom"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-200 hover:bg-[#e67c73] rounded-full flex items-center justify-center transition-colors group"
              >
                <Youtube className="w-4 h-4 text-gray-600 group-hover:text-white" />
              </a>
            </div>
          </div>

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
                  Para Perros
                </Link>
              </li>
              <li>
                <Link href="/catalogo?category=gatos" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Para Gatos
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

          {/* Legal */}
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
                  Devoluciones y Reembolsos
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
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 mt-0.5 text-[#7baaf7]" />
                <span>hola@petcom.mx</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 mt-0.5 text-[#7baaf7]" />
                <span>+52 (55) 1234-5678</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 text-[#7baaf7]" />
                <span>Ciudad de México, México</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              Lunes a Viernes: 9am - 6pm<br />
              Sábados: 10am - 2pm
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 mt-10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Hecho con <Heart className="w-4 h-4 text-[#e67c73] fill-current" /> para las mascotas de México
            </p>
            <p className="text-gray-400 text-xs">
              © 2026 PETCOM. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
