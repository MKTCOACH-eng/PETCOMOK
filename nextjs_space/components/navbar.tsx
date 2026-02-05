'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, Menu, X, LogOut, Package, Search, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { data: session } = useSession() || {};
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/LOGO/FAV.png"
              alt="Petcom"
              width={40}
              height={40}
              style={{ width: 'auto', height: '40px' }}
              priority
            />
          </Link>

          {/* Search - Desktop (centrado) */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="¿Qué estás buscando para tu mascota?"
                className="w-full pl-12 pr-4 py-2.5 rounded-full bg-gray-100 border border-transparent focus:border-[#7baaf7] focus:bg-white focus:outline-none transition-all text-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* Blog Link - Desktop */}
          <Link
            href="/blog"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <BookOpen className="w-4 h-4" />
            Blog & Tips
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>

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
                  href="/mis-mascotas"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-xl"
                  title="Mis Mascotas"
                >
                  🐾
                </Link>
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

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-3 border-t border-gray-100"
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué estás buscando para tu mascota?"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:border-[#7baaf7] focus:bg-white focus:outline-none transition-all"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4 space-y-2"
            >
              {/* Blog link for everyone */}
              <Link
                href="/blog"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-[#7baaf7] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5" />
                Blog & Tips
              </Link>
              
              <Link
                href="/catalogo"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="w-5 h-5" />
                Ver Catálogo
              </Link>
              
              {session ? (
                <>
                  <Link
                    href="/mis-mascotas"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-[#e67c73] font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🐾 Mis Mascotas
                  </Link>
                  <Link
                    href="/pedidos"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="w-5 h-5" />
                    Mis Pedidos
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
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
