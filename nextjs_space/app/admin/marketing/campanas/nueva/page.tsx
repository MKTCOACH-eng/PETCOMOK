'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  Eye, 
  Users, 
  Calendar,
  FileText,
  Loader2,
  CheckCircle,
  Dog,
  Cat,
  UserPlus,
  ShoppingBag,
  UserX,
  Star,
  Clock
} from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  subject: string;
  preheader: string;
  content: string;
}

const segmentIcons: Record<string, any> = {
  users: Users,
  'user-plus': UserPlus,
  'shopping-bag': ShoppingBag,
  'user-x': UserX,
  star: Star,
  dog: Dog,
  cat: Cat,
};

export default function NuevaCampanaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; total: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'segment' | 'schedule'>('content');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    preheader: '',
    content: '',
    segment: 'all',
    templateId: '',
    scheduledAt: '',
  });

  useEffect(() => {
    // Fetch segments
    fetch('/api/admin/marketing/segments')
      .then(res => res.json())
      .then(data => setSegments(data))
      .catch(() => {});

    // Fetch templates
    fetch('/api/admin/marketing/templates')
      .then(res => res.json())
      .then(data => setTemplates(data))
      .catch(() => {});
  }, []);

  const selectedSegment = segments.find(s => s.id === formData.segment);

  const applyTemplate = (template: Template) => {
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      preheader: template.preheader || '',
      content: template.content,
      templateId: template.id,
    }));
  };

  const handleSaveDraft = async () => {
    if (!formData.subject || !formData.content) {
      alert('Por favor completa el asunto y contenido');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: formData.name || `Campaña ${new Date().toLocaleDateString('es-MX')}`,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar');
      
      const campaign = await res.json();
      setCampaignId(campaign.id);
      alert('Campaña guardada como borrador');
    } catch (error) {
      alert('Error al guardar la campaña');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!formData.scheduledAt) {
      alert('Selecciona una fecha y hora');
      return;
    }

    if (!formData.subject || !formData.content) {
      alert('Por favor completa el asunto y contenido');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: formData.name || `Campaña ${new Date().toLocaleDateString('es-MX')}`,
        }),
      });

      if (!res.ok) throw new Error('Error al programar');
      
      alert(`Campaña programada para ${new Date(formData.scheduledAt).toLocaleString('es-MX')}`);
      router.push('/admin/marketing/campanas');
    } catch (error) {
      alert('Error al programar la campaña');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async () => {
    if (!formData.subject || !formData.content) {
      alert('Por favor completa el asunto y contenido');
      return;
    }

    const recipientCount = selectedSegment?.count || 0;
    if (!confirm(`¿Enviar esta campaña a ${recipientCount} suscriptores ahora?`)) {
      return;
    }

    setSending(true);
    try {
      // First create the campaign
      const createRes = await fetch('/api/admin/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: formData.name || `Campaña ${new Date().toLocaleDateString('es-MX')}`,
        }),
      });

      if (!createRes.ok) throw new Error('Error al crear');
      const campaign = await createRes.json();

      // Then send it
      const sendRes = await fetch(`/api/admin/marketing/campaigns/${campaign.id}/send`, {
        method: 'POST',
      });

      if (!sendRes.ok) throw new Error('Error al enviar');
      
      const data = await sendRes.json();
      setResult({ success: data.sent, failed: data.failed, total: data.total });
    } catch (error: any) {
      alert(error.message || 'Error al enviar la campaña');
    } finally {
      setSending(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Campaña enviada!</h2>
          <p className="text-gray-600 mb-6">
            Se enviaron <strong>{result.success}</strong> de {result.total} emails.
            {result.failed > 0 && (
              <span className="text-red-600"> {result.failed} fallaron.</span>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/admin/marketing/campanas"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Ver campañas
            </Link>
            <Link
              href="/admin/marketing"
              className="px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7]"
            >
              Volver a Marketing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/marketing/campanas" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Campaña</h1>
            <p className="text-gray-600">Crea y envía tu email marketing</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'content' ? 'text-[#7baaf7] border-b-2 border-[#7baaf7] bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Contenido
          </button>
          <button
            onClick={() => setActiveTab('segment')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'segment' ? 'text-[#7baaf7] border-b-2 border-[#7baaf7] bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Audiencia ({selectedSegment?.count || 0})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'schedule' ? 'text-[#7baaf7] border-b-2 border-[#7baaf7] bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Programar
          </button>
        </div>

        <div className="p-6">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Templates */}
              {templates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plantillas</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className={`p-3 border-2 rounded-lg text-left transition-all ${
                          formData.templateId === template.id
                            ? 'border-[#7baaf7] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900 text-sm">{template.name}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la campaña</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Promoción Febrero 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto del email *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ej: 🐶 ¡20% de descuento en alimentos premium!"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preheader (texto de vista previa)</label>
                <input
                  type="text"
                  value={formData.preheader}
                  onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
                  placeholder="Texto que aparece junto al asunto en la bandeja"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido del email *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escribe el contenido de tu email. Usa {{nombre}} para personalizar."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Puedes usar HTML y la variable {'{{nombre}}'} para personalizar</p>
              </div>
            </div>
          )}

          {/* Segment Tab */}
          {activeTab === 'segment' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Selecciona a quién quieres enviar esta campaña:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {segments.map(segment => {
                  const Icon = segmentIcons[segment.icon] || Users;
                  return (
                    <button
                      key={segment.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, segment: segment.id })}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        formData.segment === segment.id
                          ? 'border-[#7baaf7] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${segment.color}-100`}>
                          <Icon className={`w-5 h-5 text-${segment.color}-600`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{segment.name}</p>
                          <p className="text-sm text-gray-500">{segment.count.toLocaleString()} suscriptores</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Programar envío</p>
                    <p className="text-sm text-blue-700">Selecciona fecha y hora para enviar automáticamente</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de envío</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                />
              </div>

              {formData.scheduledAt && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  📅 La campaña se enviará el {new Date(formData.scheduledAt).toLocaleString('es-MX')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {showPreview && formData.content && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Vista Previa</h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500 mb-1">Asunto: <strong>{formData.subject}</strong></p>
            {formData.preheader && (
              <p className="text-sm text-gray-400 mb-4">{formData.preheader}</p>
            )}
            <div 
              className="prose prose-sm max-w-none bg-white p-4 rounded border"
              dangerouslySetInnerHTML={{ __html: formData.content.replace(/{{nombre}}/gi, 'Juan') }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <Users className="w-4 h-4 inline mr-1" />
            Se enviará a <strong>{selectedSegment?.count || 0}</strong> suscriptores ({selectedSegment?.name || 'Todos'})
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={loading || sending}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Clock className="w-4 h-4" />
              Guardar borrador
            </button>
            {formData.scheduledAt ? (
              <button
                onClick={handleSchedule}
                disabled={loading || sending}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                Programar envío
              </button>
            ) : (
              <button
                onClick={handleSendNow}
                disabled={loading || sending}
                className="flex items-center gap-2 px-6 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Enviando...' : 'Enviar ahora'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
