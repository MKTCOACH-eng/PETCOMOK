import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="relative w-40 h-16 mb-4">
              <Image
                src="https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/LOGO/petcom.png"
                alt="Petcom"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-gray-400 text-sm">
              El hogar de quienes aman a sus mascotas. Productos seleccionados con cariño para el bienestar de tu compañero peludo.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Explora</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/catalogo" className="text-gray-400 hover:text-[#7baaf7] transition-colors text-sm">
                  Todos los Productos
                </Link>
              </li>
              <li>
                <Link href="/catalogo?category=perros" className="text-gray-400 hover:text-[#7baaf7] transition-colors text-sm">
                  Para Perros
                </Link>
              </li>
              <li>
                <Link href="/catalogo?category=gatos" className="text-gray-400 hover:text-[#7baaf7] transition-colors text-sm">
                  Para Gatos
                </Link>
              </li>
              <li>
                <Link href="/catalogo?category=mascotas-pequenas" className="text-gray-400 hover:text-[#7baaf7] transition-colors text-sm">
                  Mascotas Pequeñas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">¿Necesitas ayuda?</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>hola@petcom.mx</li>
              <li>+52 (55) 1234-5678</li>
              <li>Lunes a Viernes: 9am - 6pm</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
            Hecho con <Heart className="w-4 h-4 text-[#e67c73] fill-current" /> para las mascotas de México
          </p>
          <p className="text-gray-600 text-xs mt-2">
            © 2026 PETCOM. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
