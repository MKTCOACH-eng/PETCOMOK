import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#7baaf7] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🐾</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PETCOM</span>
            </div>
            <p className="text-gray-600 text-sm">
              Tu tienda de confianza para todo lo que tu mascota necesita. 
              Productos premium para perros, gatos y más.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Tienda</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/catalogo" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link href="/catalogo?category=perros" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Productos para Perros
                </Link>
              </li>
              <li>
                <Link href="/catalogo?category=gatos" className="text-gray-600 hover:text-[#7baaf7] transition-colors text-sm">
                  Productos para Gatos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>soporte@petcom.mx</li>
              <li>+52 (55) 1234-5678</li>
              <li>Lunes a Viernes: 9am - 6pm</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
            Hecho con <Heart className="w-4 h-4 text-[#e67c73] fill-current" /> para las mascotas de México
          </p>
          <p className="text-gray-400 text-xs mt-2">
            © {new Date().getFullYear()} PETCOM. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
