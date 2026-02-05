'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Gift, TrendingUp, Clock, Check, ChevronRight, Coins, ArrowRight } from 'lucide-react';

export default function MisPuntosPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{ code: string; name: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
      fetchRewards();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/loyalty/account');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/loyalty/rewards');
      const json = await res.json();
      setRewards(json.rewards || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      });
      const json = await res.json();
      
      if (res.ok) {
        setRedeemSuccess({ code: json.couponCode, name: json.reward.name });
        fetchData();
        fetchRewards();
      } else {
        alert(json.error || 'Error al canjear');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setRedeeming(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#7baaf7] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data?.account) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Programa de Lealtad</h1>
        <p className="text-gray-500 mb-6">Inicia sesión para ver tus puntos</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[#7baaf7] text-white rounded-lg">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const { account, history, tiers, nextTier, progressToNextTier, settings } = data;

  const typeLabels: Record<string, string> = {
    EARNED: 'Ganados',
    REDEEMED: 'Canjeados',
    BONUS: 'Bono',
    EXPIRED: 'Expirados',
  };

  const typeColors: Record<string, string> = {
    EARNED: 'text-green-600',
    REDEEMED: 'text-blue-600',
    BONUS: 'text-purple-600',
    EXPIRED: 'text-red-600',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Success Modal */}
      {redeemSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Felicidades!</h2>
            <p className="text-gray-600 mb-4">Has canjeado "{redeemSuccess.name}"</p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Tu código de cupón:</p>
              <p className="text-2xl font-mono font-bold text-[#7baaf7]">{redeemSuccess.code}</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">Usa este código en tu próxima compra</p>
            <button
              onClick={() => setRedeemSuccess(null)}
              className="w-full py-3 bg-[#7baaf7] text-white rounded-lg font-medium hover:bg-[#5a8fe6]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Puntos PETCOM</h1>
        <p className="text-gray-500 mt-1">Acumula puntos y canjea recompensas exclusivas</p>
      </div>

      {/* Points Card */}
      <div className="bg-gradient-to-br from-[#7baaf7] to-[#5a8fe6] rounded-2xl p-6 md:p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">Puntos disponibles</p>
            <p className="text-5xl md:text-6xl font-bold">{account.currentPoints.toLocaleString()}</p>
            {account.tier && (
              <div className="flex items-center gap-2 mt-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: account.tier.color }} />
                <span className="font-medium">Nivel {account.tier.name}</span>
                {account.tier.pointsMultiplier > 1 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {account.tier.pointsMultiplier}x puntos
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="md:text-right">
            <p className="text-white/80 text-sm">Total acumulado histórico</p>
            <p className="text-2xl font-bold">{account.totalPoints.toLocaleString()} pts</p>
            <p className="text-white/60 text-sm mt-1">{account.totalOrders} pedidos</p>
          </div>
        </div>

        {/* Progress to next tier */}
        {nextTier && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso a {nextTier.name}</span>
              <span>{Math.round(progressToNextTier)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progressToNextTier}%` }}
              />
            </div>
            <p className="text-xs text-white/60 mt-2">
              {(nextTier.minPoints - account.totalPoints).toLocaleString()} puntos más para alcanzar {nextTier.name}
            </p>
          </div>
        )}
      </div>

      {/* How to earn */}
      {settings && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5" />
            ¿Cómo ganar puntos?
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold">{settings.pointsPerPeso}pt</span>
              <span className="text-gray-600">por cada $1 de compra</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold">+{settings.signupBonus}pts</span>
              <span className="text-gray-600">al registrarte</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold">+{settings.firstPurchaseBonus}pts</span>
              <span className="text-gray-600">primera compra</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold">+{settings.reviewBonus}pts</span>
              <span className="text-gray-600">por cada reseña</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Rewards */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-500" />
            Recompensas Disponibles
          </h2>
          
          {rewards.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay recompensas disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`bg-white rounded-xl border p-5 ${reward.canRedeem ? 'border-purple-200' : 'border-gray-200 opacity-70'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                    </div>
                    {reward.isFeatured && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">⭐</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="text-lg font-bold text-amber-600">{reward.pointsCost.toLocaleString()} pts</p>
                      {!reward.canRedeem && reward.pointsNeeded > 0 && (
                        <p className="text-xs text-gray-500">Te faltan {reward.pointsNeeded.toLocaleString()} pts</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRedeem(reward.id)}
                      disabled={!reward.canRedeem || redeeming === reward.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reward.canRedeem
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {redeeming === reward.id ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Canjeando...
                        </span>
                      ) : reward.canRedeem ? (
                        'Canjear'
                      ) : (
                        'Puntos insuficientes'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Historial
          </h2>
          
          {history.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Aún no tienes movimientos</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border divide-y">
              {history.map((tx: any) => (
                <div key={tx.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <span className={`font-bold ${typeColors[tx.type] || 'text-gray-600'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tiers */}
      {tiers.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Niveles del Programa
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier: any) => {
              const isCurrent = account.tier?.id === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`rounded-xl p-5 border-2 transition-all ${
                    isCurrent ? 'border-[#7baaf7] bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="font-bold" style={{ color: tier.color }}>{tier.name}</span>
                    {isCurrent && (
                      <span className="ml-auto text-xs bg-[#7baaf7] text-white px-2 py-0.5 rounded-full">Actual</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{tier.minPoints.toLocaleString()} puntos</p>
                  <ul className="text-xs space-y-1 text-gray-600">
                    <li>• {tier.pointsMultiplier}x puntos en compras</li>
                    {tier.discountPercent > 0 && <li>• {tier.discountPercent}% descuento permanente</li>}
                    {tier.freeShipping && <li>• Envío gratis siempre</li>}
                    {tier.birthdayBonus > 0 && <li>• +{tier.birthdayBonus} pts en cumpleaños</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">¡Gana más puntos hoy!</h2>
        <p className="text-white/80 mb-6">Cada compra te acerca a recompensas increíbles</p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-bold rounded-full hover:bg-gray-100 transition-colors"
        >
          Explorar Productos
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
