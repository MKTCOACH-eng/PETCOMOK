'use client';

import { useState } from 'react';
import { Brain, CheckCircle, XCircle, AlertTriangle, Loader2, X, Star, ThumbsUp, ThumbsDown, Shield } from 'lucide-react';

interface Provider {
  id: string;
  businessName: string;
}

interface AIAnalysis {
  ratingEstimado: number;
  numReviewsEstimadas: number;
  resumenPositivo: string;
  resumenNegativo: string;
  factoresDeRiesgo: string[];
  factoresPositivos: string[];
  recomendacion: 'APROBAR' | 'RECHAZAR' | 'REVISAR';
  justificacion: string;
  confianzaAnalisis: number;
}

export function AIReviewButton({ provider }: { provider: Provider }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState('');

  const analyzeProvider = async () => {
    setLoading(true);
    setError('');
    setShowModal(true);

    try {
      const res = await fetch(`/api/admin/servicios/${provider.id}/ai-review`, {
        method: 'POST'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al analizar');
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Error al realizar el análisis');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case 'APROBAR':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'RECHAZAR':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'REVISAR':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'APROBAR':
        return <CheckCircle className="w-6 h-6" />;
      case 'RECHAZAR':
        return <XCircle className="w-6 h-6" />;
      case 'REVISAR':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <>
      <button
        onClick={analyzeProvider}
        disabled={loading}
        className="px-3 py-1.5 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 flex items-center gap-1 disabled:opacity-50"
        title="Analizar con IA"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
        IA Review
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !loading && setShowModal(false)}>
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Análisis IA de Reputación</h3>
                  <p className="text-sm text-gray-600">{provider.businessName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">Analizando reputación online...</p>
                  <p className="text-sm text-gray-500 mt-2">Buscando reviews en la red</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                  <button
                    onClick={analyzeProvider}
                    className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {analysis && !loading && (
                <div className="space-y-6">
                  {/* Recommendation Box */}
                  <div className={`p-4 rounded-xl border-2 ${getRecommendationStyle(analysis.recomendacion)}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {getRecommendationIcon(analysis.recomendacion)}
                      <span className="text-xl font-bold">Recomendación: {analysis.recomendacion}</span>
                    </div>
                    <p className="text-sm opacity-90">{analysis.justificacion}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-5 h-5 text-amber-500 fill-current" />
                        <span className="text-2xl font-bold text-gray-900">{analysis.ratingEstimado.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-600">Rating Estimado</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <span className="text-2xl font-bold text-gray-900">{analysis.numReviewsEstimadas}</span>
                      <p className="text-xs text-gray-600">Reviews Estimadas</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Shield className="w-5 h-5 text-purple-500" />
                        <span className="text-2xl font-bold text-gray-900">{analysis.confianzaAnalisis}%</span>
                      </div>
                      <p className="text-xs text-gray-600">Confianza</p>
                    </div>
                  </div>

                  {/* Positive Factors */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsUp className="w-5 h-5 text-green-500" />
                      <h4 className="font-semibold text-gray-900">Factores Positivos</h4>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-gray-700 mb-3">{analysis.resumenPositivo}</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.factoresPositivos.map((factor, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsDown className="w-5 h-5 text-red-500" />
                      <h4 className="font-semibold text-gray-900">Factores de Riesgo</h4>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                      <p className="text-sm text-gray-700 mb-3">{analysis.resumenNegativo}</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.factoresDeRiesgo.map((factor, i) => (
                          <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
                    <p>⚠️ Este análisis es generado por IA y debe ser considerado como una herramienta de apoyo, no como una decisión final.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
