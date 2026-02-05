import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Shield, Heart } from 'lucide-react';
import prisma from '@/lib/db';
import { ProductCard } from '@/components/product-card';

export const dynamic = 'force-dynamic';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: { name: string } | null;
}

const CATEGORIES = [
  {
    name: 'Perros',
    slug: 'perros',
    image: 'https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/iconos/WhatsApp%20Image%202026-02-04%20at%2018.21.09.jpeg',
  },
  {
    name: 'Gatos',
    slug: 'gatos',
    image: 'https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/iconos/WhatsApp%20Image%202026-02-04%20at%2018.22.33.jpeg',
  },
  {
    name: 'Mascotas Pequeñas',
    slug: 'mascotas-pequenas',
    image: 'https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/iconos/WhatsApp%20Image%202026-02-04%20at%2018.24.28.jpeg',
  },
  {
    name: 'Aves',
    slug: 'aves',
    image: 'https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/iconos/WhatsApp%20Image%202026-02-04%20at%2018.29.37.jpeg',
  },
];

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true },
    include: { category: true },
    take: 6,
  });
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video */}
      <section className="relative h-[75vh] min-h-[550px] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        
        {/* Content */}
        <div className="relative z-10 h-full max-w-[1200px] mx-auto px-4 flex flex-col items-center justify-center text-center">
          {/* Logo grande - 50% más grande */}
          <div className="relative w-[430px] md:w-[576px] h-48 md:h-60 mb-8">
            <Image
              src="https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/LOGO/logo%20blanco.png"
              alt="Petcom"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-2xl">
            Donde el amor por tu mascota se convierte en bienestar
          </p>
          
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#7baaf7] hover:bg-[#6999e6] text-white font-semibold rounded-full transition-all shadow-lg shadow-[#7baaf7]/30 hover:scale-105"
          >
            Descubre nuestra selección
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[#F7F8FA]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">¿A quién estamos consintiendo hoy?</h2>
            <p className="text-gray-600">Elige a tu compañero y encuentra lo mejor para él</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/catalogo?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover object-top group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Lo que más les gusta</h2>
              <p className="text-gray-600">Productos favoritos de nuestra comunidad peluda</p>
            </div>
            <Link
              href="/catalogo"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-[#7baaf7] hover:bg-[#7baaf7]/10 rounded-lg font-medium transition-colors"
            >
              Ver todo
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
                <h3 className="font-semibold text-gray-900 mb-1">Llega volando</h3>
                <p className="text-sm text-gray-600">Enviamos a todo México en 24-48 horas. Tu mascota no tendrá que esperar.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-[#41b375]/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#41b375]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Compra tranquilo</h3>
                <p className="text-sm text-gray-600">Pagos 100% seguros. Si algo no está bien, lo resolvemos juntos.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-[#e67c73]/10 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#e67c73]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Selección con cariño</h3>
                <p className="text-sm text-gray-600">Cada producto lo elegiríamos para nuestras propias mascotas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Video Background */}
      <section className="relative py-24 overflow-hidden">
        {/* Video Background - Cute pets */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/9400102/9400102-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#7baaf7]/90 to-[#ba67c8]/90" />
        
        {/* Content */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Tu mascota merece lo mejor
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Únete a miles de familias que confían en nosotros para el cuidado diario de sus compañeros.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#7baaf7] font-bold rounded-full hover:bg-gray-100 transition-colors shadow-xl hover:scale-105"
          >
            Empezar a explorar
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
