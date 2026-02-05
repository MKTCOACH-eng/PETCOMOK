'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tag, 
  Truck, 
  LogOut,
  Menu,
  X,
  Home,
  Users,
  Ticket,
  Megaphone,
  FileText,
  Globe,
  Stethoscope,
  Award
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Dropshipping', href: '/admin/dropshipping', icon: Globe },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'Envíos', href: '/admin/envios', icon: Truck },
  { name: 'Servicios', href: '/admin/servicios', icon: Stethoscope },
  { name: 'Clientes', href: '/admin/clientes', icon: Users },
  { name: 'Lealtad', href: '/admin/lealtad', icon: Award },
  { name: 'Blog & Tips', href: '/admin/contenido', icon: FileText },
  { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { name: 'Categorías', href: '/admin/categorias', icon: Tag },
  { name: 'Cupones', href: '/admin/cupones', icon: Ticket },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="relative w-10 h-10">
          <Image
            src="https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/LOGO/Favicon.png"
            alt="Petcom"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="font-bold text-gray-900">PETCOM</h1>
          <p className="text-xs text-gray-500">Panel de Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#7baaf7] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Home className="w-5 h-5" />
          Ver Tienda
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/LOGO/Favicon.png"
              alt="Petcom"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-gray-900">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-64 lg:flex-col bg-white border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
