'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, Users, Star, Eye, Phone, Mail, Clock, 
  CheckCircle, XCircle, AlertTriangle, LogOut, MessageCircle,
  TrendingUp, Calendar, ChevronRight, ExternalLink
} from 'lucide-react';

interface Lead {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  petType: string | null;
  petName: string | null;
  message: string | null;
  serviceInterest: string | null;
  status: string;
  createdAt: string;
  viewedAt: string | null;
  contactedAt: string | null;
}

interface DashboardData {
  provider: {
    id: string;
    businessName: string;
    email: string;
    phone: string;
    membershipStatus: string;
    membershipEndDate: string | null;
    isApproved: boolean;
    totalLeads: number;
    totalViews: number;
    totalReviews: number;
    averageRating: number;
    category: { name: string };
  };
  leads: Lead[];
  reviews: any[];
  stats: {
    leadStats: any[];
    recentLeadsCount: number;
    totalLeads: number;
    totalReviews: number;
  };
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700'
};

const statusLabels: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  converted: 'Convertido',
  lost: 'Perdido'
};

export default function ProviderDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/proveedor/dashboard');
      if (res.status === 401) {
        router.push('/proveedor/login');
        return;
      }
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/proveedor/auth', { method: 'DELETE' });
    router.push('/proveedor/login');
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await fetch(`/api/proveedor/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchDashboard();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7baaf7] border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Error al cargar el dashboard</h1>
          <Link href="/proveedor/login" className="text-[#7baaf7] hover:underline">Volver al login</Link>
        </div>
      </div>
    );
  }

  const { provider, leads, stats } = data;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image src="/logo-petcom.png" alt="PETCOM" width={120} height={40} />
            </Link>
            <span className="text-gray-300">|</span>
            <span className="font-medium text-gray-700">Portal de Proveedores</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{provider.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Alerts */}
        {!provider.isApproved && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Tu cuenta está pendiente de aprobación</p>
              <p className="text-sm">Nuestro equipo revisará tu información pronto.</p>
            </div>
          </div>
        )}

        {provider.membershipStatus !== 'active' && provider.isApproved && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3 text-orange-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Tu membresía no está activa</p>
                <p className="text-sm">Activa tu membresía para aparecer en el directorio.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#7baaf7] text-white rounded-lg font-medium hover:bg-[#6a9be6]">
              Activar por $299/mes
            </button>
          </div>
        )}

        {/* Welcome & Stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hola, {provider.businessName}</h1>
          <p className="text-gray-600">Aquí puedes ver tus leads y estadísticas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{provider.totalLeads}</p>
            <p className="text-sm text-gray-600">Leads recibidos</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-xs text-gray-500">Últimos 30 días</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.recentLeadsCount}</p>
            <p className="text-sm text-gray-600">Leads recientes</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-purple-500" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{provider.totalViews}</p>
            <p className="text-sm text-gray-600">Visitas a tu perfil</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-amber-500" />
              <span className="text-xs text-gray-500">{provider.totalReviews} reseñas</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{provider.averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-600">Calificación promedio</p>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">Leads Recibidos</h2>
            <p className="text-sm text-gray-600">Clientes interesados en tus servicios</p>
          </div>

          {leads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mascota</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{lead.customerName}</p>
                        {lead.message && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">{lead.message}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <a href={`mailto:${lead.customerEmail}`} className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#7baaf7]">
                            <Mail className="w-4 h-4" />
                            {lead.customerEmail}
                          </a>
                          {lead.customerPhone && (
                            <a href={`tel:${lead.customerPhone}`} className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#7baaf7]">
                              <Phone className="w-4 h-4" />
                              {lead.customerPhone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {lead.petType && <p>{lead.petType}</p>}
                        {lead.petName && <p className="text-gray-500">{lead.petName}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status]}`}>
                          {statusLabels[lead.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="text-sm border rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#7baaf7]"
                        >
                          <option value="new">Nuevo</option>
                          <option value="contacted">Contactado</option>
                          <option value="converted">Convertido</option>
                          <option value="lost">Perdido</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no tienes leads</h3>
              <p className="text-gray-600">Cuando los clientes te contacten, aparecerán aquí</p>
            </div>
          )}
        </div>

        {/* View Profile Link */}
        <div className="mt-6 text-center">
          <Link
            href={`/servicios/${provider.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-[#7baaf7] hover:underline"
          >
            Ver mi perfil público
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
