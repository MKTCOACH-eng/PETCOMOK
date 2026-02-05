'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, Menu, X, LogOut, Package } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { data: session } = useSession() || {};
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#7baaf7] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🐾</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PETCOM</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/catalogo" className="text-gray-600 hover:text-[#7baaf7] transition-colors font-medium">
              Catálogo
            </Link>
            <Link href="/catalogo?category=perros" className="text-gray-600 hover:text-[#7baaf7] transition-colors font-medium">
              Perros
            </Link>
            <Link href="/catalogo?category=gatos" className="text-gray-600 hover:text-[#7baaf7] transition-colors font-medium">
              Gatos
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/carrito"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[#e67c73] text-white text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {session ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/pedidos"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Mis Pedidos"
                >
                  <Package className="w-6 h-6 text-gray-700" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7baaf7] hover:bg-[#6999e6] transition-colors text-white font-medium"
              >
                <User className="w-4 h-4" />
                Ingresar
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4 space-y-2"
            >
              <Link
                href="/catalogo"
                className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link
                href="/catalogo?category=perros"
                className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Perros
              </Link>
              <Link
                href="/catalogo?category=gatos"
                className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gatos
              </Link>
              {session ? (
                <>
                  <Link
                    href="/pedidos"
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis Pedidos
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 rounded-lg bg-[#7baaf7] text-white text-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ingresar
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
