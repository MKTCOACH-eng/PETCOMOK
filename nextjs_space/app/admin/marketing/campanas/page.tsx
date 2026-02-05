import Link from 'next/link';
import prisma from '@/lib/db';
import { 
  Send, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Users,
  Mail,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { DeleteCampaignButton } from './delete-button';

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Borrador', color: 'gray', icon: Clock },
  scheduled: { label: 'Programada', color: 'blue', icon: Calendar },
  sending: { label: 'Enviando...', color: 'yellow', icon: Loader2 },
  sent: { label: 'Enviada', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'red', icon: XCircle },
};

const segmentLabels: Record<string, string> = {
  all: 'Todos',
  new: 'Nuevos',
  active: 'Activos',
  inactive: 'Inactivos',
  high_value: 'Alto valor',
  pet_dog: 'Dueños de perros',
  pet_cat: 'Dueños de gatos',
};

export default async function CampanasPage() {
  const campaigns = await prisma.emailCampaign.findMany({
    include: { template: true },
    orderBy: { createdAt: 'desc' }
  });

  // Stats
  const totalSent = campaigns.filter(c => c.status === 'sent').length;
  const totalDraft = campaigns.filter(c => c.status === 'draft').length;
  const totalScheduled = campaigns.filter(c => c.status === 'scheduled').length;
  const totalEmails = campaigns.reduce((sum, c) => sum + c.sentCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campañas de Email</h1>
          <p className="text-gray-600">Historial y gestión de campañas</p>
        </div>
        <Link
          href="/admin/marketing/campanas/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Campaña
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalSent}</p>
              <p className="text-xs text-gray-500">Enviadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalScheduled}</p>
              <p className="text-xs text-gray-500">Programadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalDraft}</p>
              <p className="text-xs text-gray-500">Borradores</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalEmails.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Emails enviados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {campaigns.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {campaigns.map((campaign) => {
              const status = statusConfig[campaign.status] || statusConfig.draft;
              const StatusIcon = status.icon;
              
              return (
                <div key={campaign.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {campaign.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2">
                        <strong>Asunto:</strong> {campaign.subject}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {segmentLabels[campaign.segment || 'all']}
                        </span>
                        {campaign.status === 'sent' && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {campaign.sentCount}/{campaign.totalRecipients} enviados
                          </span>
                        )}
                        {campaign.scheduledAt && campaign.status === 'scheduled' && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(campaign.scheduledAt).toLocaleString('es-MX')}
                          </span>
                        )}
                        {campaign.sentAt && (
                          <span>
                            Enviada: {new Date(campaign.sentAt).toLocaleString('es-MX')}
                          </span>
                        )}
                        <span>
                          Creada: {new Date(campaign.createdAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {campaign.status === 'draft' && (
                        <Link
                          href={`/admin/marketing/campanas/${campaign.id}`}
                          className="px-3 py-1.5 text-sm bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7]"
                        >
                          Editar
                        </Link>
                      )}
                      {campaign.status !== 'sent' && campaign.status !== 'sending' && (
                        <DeleteCampaignButton campaignId={campaign.id} campaignName={campaign.name} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No hay campañas aún</h3>
            <p className="text-gray-500 mb-4">Crea tu primera campaña de email marketing</p>
            <Link
              href="/admin/marketing/campanas/nueva"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7]"
            >
              <Plus className="w-4 h-4" />
              Crear Campaña
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
