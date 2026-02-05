import Link from 'next/link';
import { prisma } from '@/lib/db';
import { 
  Users, CheckCircle, Clock, AlertTriangle, Star, Eye, 
  Stethoscope, Scissors, GraduationCap, Home as HomeIcon, Dog,
  Building, MapPin, Phone, Mail, ExternalLink
} from 'lucide-react';
import { ApprovalButtons } from './approval-buttons';

export const dynamic = 'force-dynamic';

const serviceCategoryIcons: Record<string, React.ReactNode> = {
  veterinarios: <Stethoscope className="w-5 h-5" />,
  esteticas: <Scissors className="w-5 h-5" />,
  entrenadores: <GraduationCap className="w-5 h-5" />,
  hospedaje: <HomeIcon className="w-5 h-5" />,
  paseadores: <Dog className="w-5 h-5" />,
};

const membershipStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700'
};

const membershipStatusLabels: Record<string, string> = {
  pending: 'Pendiente',
  active: 'Activa',
  expired: 'Expirada',
  cancelled: 'Cancelada'
};

async function getStats() {
  const [total, pending, active, totalLeads] = await Promise.all([
    prisma.serviceProvider.count(),
    prisma.serviceProvider.count({ where: { isApproved: false } }),
    prisma.serviceProvider.count({ where: { isApproved: true, membershipStatus: 'active' } }),
    prisma.serviceLead.count()
  ]);
  return { total, pending, active, totalLeads };
}

async function getProviders(filter?: string) {
  const where: any = {};
  
  if (filter === 'pending') {
    where.isApproved = false;
  } else if (filter === 'active') {
    where.isApproved = true;
    where.membershipStatus = 'active';
  }

  return prisma.serviceProvider.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      _count: {
        select: { leads: true, reviews: true }
      }
    }
  });
}

async function getCategories() {
  return prisma.serviceCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { providers: true } }
    }
  });
}

export default async function AdminServiciosPage({
  searchParams
}: {
  searchParams: { filter?: string }
}) {
  const stats = await getStats();
  const providers = await getProviders(searchParams.filter);
  const categories = await getCategories();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores de Servicios</h1>
          <p className="text-gray-600">Gestiona los proveedores del marketplace</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Building className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total proveedores</p>
        </div>

        <Link href="/admin/servicios?filter=pending" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            {stats.pending > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                {stats.pending} nuevos
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pendientes de aprobar</p>
        </Link>

        <Link href="/admin/servicios?filter=active" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          <p className="text-sm text-gray-600">Activos en directorio</p>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
          <p className="text-sm text-gray-600">Leads generados</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/admin/servicios"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !searchParams.filter
              ? 'bg-[#7baaf7] text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Todos ({stats.total})
        </Link>
        <Link
          href="/admin/servicios?filter=pending"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            searchParams.filter === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Pendientes ({stats.pending})
        </Link>
        <Link
          href="/admin/servicios?filter=active"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            searchParams.filter === 'active'
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Activos ({stats.active})
        </Link>
      </div>

      {/* Providers List */}
      {providers.length > 0 ? (
        <div className="space-y-4">
          {providers.map((provider) => (
            <div key={provider.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon/Logo */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7baaf7]/20 to-[#ba67c8]/20 flex items-center justify-center flex-shrink-0">
                    {serviceCategoryIcons[provider.category.slug] || <Building className="w-7 h-7 text-[#7baaf7]" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{provider.businessName}</h3>
                      {!provider.isApproved && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                      {provider.featured && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Destacado
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#7baaf7]/10 text-[#7baaf7] rounded-full text-xs font-medium">
                        {provider.category.name}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${membershipStatusColors[provider.membershipStatus]}`}>
                        {membershipStatusLabels[provider.membershipStatus]}
                      </span>
                      {provider.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {provider.city}, {provider.state}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {provider.shortDescription || provider.description}
                    </p>

                    {/* Contact */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <a href={`mailto:${provider.email}`} className="flex items-center gap-1 text-gray-600 hover:text-[#7baaf7]">
                        <Mail className="w-4 h-4" />
                        {provider.email}
                      </a>
                      <a href={`tel:${provider.phone}`} className="flex items-center gap-1 text-gray-600 hover:text-[#7baaf7]">
                        <Phone className="w-4 h-4" />
                        {provider.phone}
                      </a>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 mt-3 pt-3 border-t text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{provider._count.leads}</span> leads
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">{provider.totalViews}</span> visitas
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">{provider.averageRating.toFixed(1)}</span>
                        <span>({provider._count.reviews})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <ApprovalButtons provider={provider} />
                  <Link
                    href={`/servicios/${provider.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver perfil
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proveedores</h3>
          <p className="text-gray-600">Los proveedores registrados aparecerán aquí</p>
        </div>
      )}

      {/* Categories Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Categorías de Servicios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#7baaf7]/10 flex items-center justify-center text-[#7baaf7]">
                  {serviceCategoryIcons[cat.slug] || <Building className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat._count.providers} proveedores</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
