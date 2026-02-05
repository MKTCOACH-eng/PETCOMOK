import Link from 'next/link';
import { ArrowRight, Truck, Shield, Heart, Dog, Cat, Package } from 'lucide-react';
import prisma from '@/lib/db';
import { ProductCard } from '@/components/product-card';

export const dynamic = 'force-dynamic';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: { name: string } | null;
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true },
    include: { category: true },
    take: 6,
  });
}

async function getCategories() {
  return prisma.category.findMany();
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/Hero_video/202602040234.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 h-full max-w-[1200px] mx-auto px-4 flex items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Todo para tu <span className="text-[#7baaf7]">mejor amigo</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Descubre productos premium para el bienestar de tus mascotas. 
              Alimentos, accesorios y más, todo en un solo lugar.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7baaf7] hover:bg-[#6999e6] text-white font-semibold rounded-lg transition-colors shadow-lg shadow-[#7baaf7]/30"
              >
                Ver Catálogo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/catalogo?category=perros"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/30"
              >
                <Dog className="w-5 h-5" />
                Perros
              </Link>
              <Link
                href="/catalogo?category=gatos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/30"
              >
                <Cat className="w-5 h-5" />
                Gatos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[#F7F8FA]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Categorías</h2>
            <p className="text-gray-600">Encuentra lo que necesitas para cada tipo de mascota</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category: Category, index: number) => {
              const icons: Record<string, React.ReactNode> = {
                perros: <Dog className="w-10 h-10" />,
                gatos: <Cat className="w-10 h-10" />,
                accesorios: <Package className="w-10 h-10" />,
              };
              const colors: Record<string, string> = {
                perros: 'bg-[#7baaf7]',
                gatos: 'bg-[#ba67c8]',
                accesorios: 'bg-[#41b375]',
              };
              
              return (
                <Link
                  key={category.id}
                  href={`/catalogo?category=${category.slug}`}
                  className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${colors[category.slug] || 'bg-gray-200'} text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    {icons[category.slug] || <Package className="w-10 h-10" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#7baaf7] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Productos Destacados</h2>
              <p className="text-gray-600">Los favoritos de nuestros clientes</p>
            </div>
            <Link
              href="/catalogo"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-[#7baaf7] hover:bg-[#7baaf7]/10 rounded-lg font-medium transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product, index: number) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7baaf7] text-white rounded-lg font-medium"
            >
              Ver todos los productos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#F7F8FA]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-[#7baaf7]/10 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#7baaf7]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Envío Rápido</h3>
                <p className="text-sm text-gray-600">Recibe tus productos en 24-48 horas en toda la república</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-[#41b375]/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#41b375]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Compra Segura</h3>
                <p className="text-sm text-gray-600">Todos tus pagos están protegidos y encriptados</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-[#e67c73]/10 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#e67c73]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Calidad Premium</h3>
                <p className="text-sm text-gray-600">Solo los mejores productos para tu mascota</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#7baaf7] to-[#ba67c8]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para consentir a tu mascota?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Únete a miles de dueños felices que confían en PETCOM para el cuidado de sus mascotas.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#7baaf7] font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-xl"
          >
            Explorar Tienda
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
