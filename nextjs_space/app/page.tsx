import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, Shield, Heart, Play, Lightbulb, FileText, Eye, Star, MapPin, Stethoscope, Scissors, GraduationCap, Home as HomeIcon, Dog, MoreHorizontal } from 'lucide-react';
import prisma from '@/lib/db';
import { ProductCard } from '@/components/product-card';
import { PersonalizedRecommendations } from '@/components/personalized-recommendations';

export const dynamic = 'force-dynamic';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: { name: string } | null;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  contentType: string;
  category: string;
  petType: string | null;
  viewCount: number;
  createdAt: Date;
}

interface ServiceProvider {
  id: string;
  businessName: string;
  slug: string;
  shortDescription: string | null;
  logoUrl: string | null;
  city: string | null;
  averageRating: number;
  totalReviews: number;
  totalLeads: number;
  category: {
    name: string;
    slug: string;
    icon: string | null;
  };
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

async function getLatestArticles() {
  return prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });
}

async function getTopServiceProviders() {
  return prisma.serviceProvider.findMany({
    where: {
      isApproved: true,
      isActive: true,
      membershipStatus: 'active'
    },
    orderBy: [
      { featured: 'desc' },
      { averageRating: 'desc' },
      { totalLeads: 'desc' }
    ],
    take: 3,
    include: {
      category: true
    }
  });
}

async function getServiceCategories() {
  return prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    take: 5
  });
}

const serviceCategoryIcons: Record<string, React.ReactNode> = {
  veterinarios: <Stethoscope className="w-5 h-5" />,
  esteticas: <Scissors className="w-5 h-5" />,
  entrenadores: <GraduationCap className="w-5 h-5" />,
  hospedaje: <HomeIcon className="w-5 h-5" />,
  paseadores: <Dog className="w-5 h-5" />,
  otro: <MoreHorizontal className="w-5 h-5" />,
};

const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <Play className="w-4 h-4" />,
  tip: <Lightbulb className="w-4 h-4" />,
  article: <FileText className="w-4 h-4" />,
};

const contentTypeLabels: Record<string, string> = {
  video: 'Video',
  tip: 'Tip',
  article: 'Artículo',
};

const categoryLabels: Record<string, string> = {
  general: 'General',
  tips: 'Tips',
  nutrition: 'Nutrición',
  health: 'Salud',
  grooming: 'Grooming',
  training: 'Entrenamiento',
};

export default async function HomePage() {
  const products = await getFeaturedProducts();
  const articles = await getLatestArticles();
  const serviceProviders = await getTopServiceProviders();
  const serviceCategories = await getServiceCategories();

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

      {/* Personalized Recommendations with AI */}
      <PersonalizedRecommendations />

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

      {/* Blog & Tips Section */}
      {articles.length > 0 && (
        <section className="py-16 bg-[#F7F8FA]">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Blog & Tips</h2>
                <p className="text-gray-600">Consejos y guías para el cuidado de tu mascota</p>
              </div>
              <Link
                href="/blog"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-[#7baaf7] hover:bg-[#7baaf7]/10 rounded-lg font-medium transition-colors"
              >
                Ver todo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles.map((article: Article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    {article.imageUrl && (
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    {/* Content Type Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        article.contentType === 'video' 
                          ? 'bg-red-500 text-white' 
                          : article.contentType === 'tip' 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {contentTypeIcons[article.contentType]}
                        {contentTypeLabels[article.contentType]}
                      </span>
                    </div>
                    {/* Play overlay for videos */}
                    {article.contentType === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-red-500 ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                        {categoryLabels[article.category] || article.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.viewCount}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#7baaf7] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7baaf7] text-white rounded-lg font-medium"
              >
                Ver más tips y artículos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Services Section - Top 3 Providers */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Hero Banner para Servicios */}
          <div className="relative rounded-2xl overflow-hidden mb-10 h-[280px] md:h-[320px]">
            <Image
              src="https://cdn.abacus.ai/images/02bec7c3-1c8f-466a-92be-a1a0cd5604e5.png"
              alt="Servicios profesionales para mascotas - Veterinarios, estéticas y más"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-xl px-8 md:px-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Servicios para tu Mascota</h2>
                <p className="text-white/90 text-lg mb-6">Encuentra los mejores profesionales cerca de ti: veterinarios, estéticas, entrenadores y más</p>
                <Link
                  href="/servicios"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#7baaf7] rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Explorar servicios
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Top 3 Service Providers */}
          {serviceProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serviceProviders.map((provider: ServiceProvider, index: number) => (
                <Link
                  key={provider.id}
                  href={`/servicios/${provider.slug}`}
                  className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Top Badge */}
                  {index === 0 && (
                    <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Más Solicitado
                    </div>
                  )}

                  {/* Provider Image/Logo */}
                  <div className="relative h-40 bg-gradient-to-br from-[#7baaf7]/20 to-[#ba67c8]/20 flex items-center justify-center">
                    {provider.logoUrl ? (
                      <Image
                        src={provider.logoUrl}
                        alt={provider.businessName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
                        {serviceCategoryIcons[provider.category.slug] || <Stethoscope className="w-10 h-10 text-[#7baaf7]" />}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category Badge */}
                    <span className="inline-block px-2 py-1 bg-[#7baaf7]/10 text-[#7baaf7] text-xs font-medium rounded-full mb-3">
                      {provider.category.name}
                    </span>

                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#7baaf7] transition-colors mb-2">
                      {provider.businessName}
                    </h3>

                    {provider.shortDescription && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {provider.shortDescription}
                      </p>
                    )}

                    {/* Rating & Location */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span className="font-medium text-gray-900">{provider.averageRating.toFixed(1)}</span>
                        <span className="text-gray-500">({provider.totalReviews})</span>
                      </div>
                      {provider.city && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden h-[300px]">
              <Image
                src="https://cdn.abacus.ai/images/9df71791-49b4-42a6-92df-c1b08f7e0433.png"
                alt="Paseador de perros profesional"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">¿Eres prestador de servicios para mascotas?</h3>
                <p className="text-white/90 mb-4">Forma parte de la comunidad PETCOM y ofrece tus servicios a miles de dueños de mascotas</p>
                <Link
                  href="/proveedor/registro"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#7baaf7] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Únete como proveedor
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7baaf7] text-white rounded-lg font-medium"
            >
              Ver todos los servicios
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
