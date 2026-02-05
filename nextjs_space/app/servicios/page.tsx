import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Search, Filter, Stethoscope, Scissors, GraduationCap, Home as HomeIcon, Dog, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface SearchParams {
  categoria?: string;
  buscar?: string;
  ciudad?: string;
}

const serviceCategoryIcons: Record<string, React.ReactNode> = {
  veterinarios: <Stethoscope className="w-5 h-5" />,
  esteticas: <Scissors className="w-5 h-5" />,
  entrenadores: <GraduationCap className="w-5 h-5" />,
  hospedaje: <HomeIcon className="w-5 h-5" />,
  paseadores: <Dog className="w-5 h-5" />,
};

async function getCategories() {
  return prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          providers: {
            where: { isApproved: true, isActive: true, membershipStatus: 'active' }
          }
        }
      }
    }
  });
}

async function getProviders(params: SearchParams) {
  const where: any = {
    isApproved: true,
    isActive: true,
    membershipStatus: 'active'
  };

  if (params.categoria) {
    where.category = { slug: params.categoria };
  }

  if (params.buscar) {
    where.OR = [
      { businessName: { contains: params.buscar, mode: 'insensitive' } },
      { description: { contains: params.buscar, mode: 'insensitive' } },
      { city: { contains: params.buscar, mode: 'insensitive' } }
    ];
  }

  if (params.ciudad) {
    where.city = { contains: params.ciudad, mode: 'insensitive' };
  }

  return prisma.serviceProvider.findMany({
    where,
    orderBy: [
      { featured: 'desc' },
      { averageRating: 'desc' },
      { totalLeads: 'desc' }
    ],
    include: {
      category: true,
      _count: {
        select: { reviews: { where: { isApproved: true } } }
      }
    }
  });
}

export default async function ServiciosPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const categories = await getCategories();
  const providers = await getProviders(searchParams);
  const activeCategory = searchParams.categoria;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#7baaf7] to-[#ba67c8] py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Servicios para Mascotas</h1>
          <p className="text-white/90 text-lg mb-8">Encuentra veterinarios, estéticas, entrenadores y más</p>
          
          {/* Search Bar */}
          <form className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="buscar"
                defaultValue={searchParams.buscar}
                placeholder="Buscar por nombre o servicio..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="relative sm:w-48">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="ciudad"
                defaultValue={searchParams.ciudad}
                placeholder="Ciudad"
                className="w-full pl-12 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-[#7baaf7] font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/servicios"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !activeCategory
                ? 'bg-[#7baaf7] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/servicios?categoria=${cat.slug}`}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-[#7baaf7] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {serviceCategoryIcons[cat.slug] || <Star className="w-4 h-4" />}
              {cat.name}
              <span className="text-xs opacity-70">({cat._count.providers})</span>
            </Link>
          ))}
        </div>

        {/* Results */}
        {providers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider, index) => (
              <Link
                key={provider.id}
                href={`/servicios/${provider.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-44 bg-gradient-to-br from-[#7baaf7]/20 to-[#ba67c8]/20 flex items-center justify-center">
                  {provider.featured && (
                    <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Destacado
                    </div>
                  )}
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
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="font-medium text-gray-900">{provider.averageRating.toFixed(1)}</span>
                      <span className="text-gray-500">({provider.totalReviews} reseñas)</span>
                    </div>
                    {provider.city && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <span className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg text-sm font-medium group-hover:bg-[#6a9be6] transition-colors">
                      Ver perfil
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No encontramos resultados</h3>
            <p className="text-gray-600 mb-6">Intenta con otros filtros o busca en otra categoría</p>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7baaf7] text-white rounded-lg font-medium"
            >
              Ver todos los servicios
            </Link>
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-12 p-8 bg-gradient-to-r from-[#7baaf7] to-[#ba67c8] rounded-2xl text-center">
          <h2 className="text-2xl font-bold text-white mb-3">¿Ofreces servicios para mascotas?</h2>
          <p className="text-white/90 mb-6">Regístrate y recibe clientes desde $299/mes</p>
          <Link
            href="/proveedor/registro"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#7baaf7] font-bold rounded-full hover:bg-gray-100 transition-colors"
          >
            Registrar mi negocio
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
