import Link from 'next/link';
import { ArrowLeft, Send, Mail, Clock, CheckCircle } from 'lucide-react';

export default function CampanasPage() {
  // In a real app, you'd fetch campaign history from the database
  const campaigns: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/marketing" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campañas de Email</h1>
            <p className="text-gray-600">Envía emails masivos a tus suscriptores</p>
          </div>
        </div>
        <Link
          href="/admin/marketing/campanas/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] transition-colors"
        >
          <Send className="w-4 h-4" />
          Nueva Campaña
        </Link>
      </div>

      {/* Campaign History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {campaigns.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{campaign.subject}</h3>
                    <p className="text-sm text-gray-500">{campaign.sentAt}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {campaign.sentCount} enviados
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {campaign.openRate}% abiertos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No hay campañas aún</h3>
            <p className="text-gray-500 mb-4">Crea tu primera campaña de email marketing</p>
            <Link
              href="/admin/marketing/campanas/nueva"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] transition-colors"
            >
              <Send className="w-4 h-4" />
              Crear Campaña
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
