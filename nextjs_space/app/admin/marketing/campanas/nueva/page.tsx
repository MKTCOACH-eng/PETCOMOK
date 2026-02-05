'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Eye, Users, AlertTriangle } from 'lucide-react';

export default function NuevaCampanaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ active: 0, total: 0 });
  const [showPreview, setShowPreview] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    preheader: '',
    content: '',
    includeUnsubscribe: true,
  });

  useEffect(() => {
    // Fetch subscriber count
    fetch('/api/admin/marketing/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!formData.subject || !formData.content) {
      alert('Por favor completa el asunto y contenido del email');
      return;
    }

    if (!confirm(`¿Enviar esta campaña a ${stats.active} suscriptores activos?`)) {
      return;
    }

    setSending(true);
    setProgress({ sent: 0, total: stats.active });

    try {
      const res = await fetch('/api/admin/marketing/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al enviar');
      }

      const data = await res.json();
      setResult({ success: data.sent, failed: data.failed });
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
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Campaña enviada!</h2>
          <p className="text-gray-600 mb-6">
            Se enviaron {result.success} emails exitosamente.
            {result.failed > 0 && ` ${result.failed} fallaron.`}
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/marketing/campanas" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Campaña</h1>
          <p className="text-gray-600">Crea y envía un email a tus suscriptores</p>
        </div>
      </div>

      {/* Subscriber Count Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <Users className="w-5 h-5 text-blue-600" />
        <p className="text-blue-800">
          Esta campaña se enviará a <strong>{stats.active}</strong> suscriptores activos
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Asunto del email *</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Ej: ¡20% de descuento en todo!"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
          />
        </div>

        {/* Preheader */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preheader <span className="text-gray-400 font-normal">(texto de vista previa)</span>
          </label>
          <input
            type="text"
            value={formData.preheader}
            onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
            placeholder="Ej: Solo por tiempo limitado..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contenido del email *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Escribe el contenido de tu email aquí...

Puedes usar saltos de línea para formatear el texto.

Variables disponibles:
{{nombre}} - Nombre del suscriptor"
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent font-mono text-sm"
          />
          <p className="text-sm text-gray-500 mt-2">
            Usa <code className="bg-gray-100 px-1 rounded">{'{{nombre}}'}</code> para personalizar con el nombre del suscriptor
          </p>
        </div>

        {/* Options */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="unsubscribe"
            checked={formData.includeUnsubscribe}
            onChange={(e) => setFormData({ ...formData, includeUnsubscribe: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-[#7baaf7] focus:ring-[#7baaf7]"
          />
          <label htmlFor="unsubscribe" className="text-sm text-gray-700">
            Incluir enlace para darse de baja (recomendado)
          </label>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold">Vista previa del email</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500">De: PETCOM &lt;hola@petcom.mx&gt;</p>
                <p className="text-sm text-gray-500">Para: suscriptor@ejemplo.com</p>
                <p className="text-sm font-medium text-gray-900">Asunto: {formData.subject || '(Sin asunto)'}</p>
              </div>
              <div className="prose prose-sm max-w-none">
                {formData.content.split('\n').map((line, i) => (
                  <p key={i}>{line.replace('{{nombre}}', 'Juan') || <br />}</p>
                ))}
                {formData.includeUnsubscribe && (
                  <p className="text-xs text-gray-400 mt-8 pt-4 border-t">
                    Si no deseas recibir más correos, puedes darte de baja aquí.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={() => setShowPreview(true)}
          disabled={!formData.content}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <Eye className="w-4 h-4" />
          Vista previa
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !formData.subject || !formData.content || stats.active === 0}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] disabled:opacity-50"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Campaña
            </>
          )}
        </button>
      </div>

      {stats.active === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">No hay suscriptores activos</p>
            <p className="text-sm text-yellow-700">Importa suscriptores o espera a que se registren desde tu sitio.</p>
          </div>
        </div>
      )}
    </div>
  );
}
