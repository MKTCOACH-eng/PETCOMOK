import Link from 'next/link';
import prisma from '@/lib/db';
import { Gift, Users, Star, Settings, TrendingUp, Award, Coins, Target } from 'lucide-react';

export default async function LealtadAdminPage() {
  // Estadísticas
  const [totalAccounts, totalPoints, totalRedemptions, settings, tiers, rewards] = await Promise.all([
    prisma.loyaltyAccount.count(),
    prisma.loyaltyAccount.aggregate({ _sum: { currentPoints: true } }),
    prisma.pointsTransaction.count({ where: { type: 'REDEEMED' } }),
    prisma.loyaltySettings.findFirst(),
    prisma.loyaltyTier.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { accounts: true } } } }),
    prisma.loyaltyReward.findMany({ where: { isActive: true }, orderBy: { pointsCost: 'asc' } }),
  ]);

  const recentTransactions = await prisma.pointsTransaction.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      account: true,
      reward: true,
    },
  });

  // Obtener nombres de usuarios para las transacciones
  const userIds = [...new Set(recentTransactions.map(t => t.account.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = new Map(users.map(u => [u.id, u]));

  const stats = [
    { label: 'Miembros Activos', value: totalAccounts, icon: Users, color: 'bg-blue-500' },
    { label: 'Puntos en Circulación', value: totalPoints._sum.currentPoints?.toLocaleString() || '0', icon: Coins, color: 'bg-amber-500' },
    { label: 'Canjes Realizados', value: totalRedemptions, icon: Gift, color: 'bg-green-500' },
    { label: 'Recompensas Activas', value: rewards.length, icon: Award, color: 'bg-purple-500' },
  ];

  const typeLabels: Record<string, string> = {
    EARNED: 'Ganados',
    REDEEMED: 'Canjeados',
    BONUS: 'Bono',
    EXPIRED: 'Expirados',
    ADJUSTMENT: 'Ajuste',
    REFERRAL: 'Referido',
  };

  const typeColors: Record<string, string> = {
    EARNED: 'text-green-600 bg-green-100',
    REDEEMED: 'text-blue-600 bg-blue-100',
    BONUS: 'text-purple-600 bg-purple-100',
    EXPIRED: 'text-red-600 bg-red-100',
    ADJUSTMENT: 'text-gray-600 bg-gray-100',
    REFERRAL: 'text-amber-600 bg-amber-100',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programa de Lealtad</h1>
          <p className="text-gray-500">Gestiona puntos, niveles y recompensas</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/lealtad/configuracion"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </Link>
        </div>
      </div>

      {/* Estado del programa */}
      {settings && (
        <div className={`p-4 rounded-lg ${settings.isActive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${settings.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={settings.isActive ? 'text-green-700' : 'text-red-700'}>
              Programa {settings.isActive ? 'Activo' : 'Inactivo'}
            </span>
            <span className="text-gray-500 text-sm ml-4">
              {settings.pointsPerPeso} punto por cada ${1} gastado | Expiran en {settings.pointsExpirationDays} días
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Niveles */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Niveles de Lealtad
            </h2>
            <Link href="/admin/lealtad/niveles" className="text-sm text-[#7baaf7] hover:underline">
              Gestionar
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {tiers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay niveles configurados</p>
            ) : (
              tiers.map((tier) => (
                <div key={tier.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tier.color }} />
                    <div>
                      <p className="font-medium text-gray-900">{tier.name}</p>
                      <p className="text-xs text-gray-500">
                        {tier.minPoints.toLocaleString()} pts | {tier.pointsMultiplier}x puntos
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{tier._count.accounts} miembros</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recompensas */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              Recompensas Activas
            </h2>
            <Link href="/admin/lealtad/recompensas" className="text-sm text-[#7baaf7] hover:underline">
              Gestionar
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {rewards.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay recompensas configuradas</p>
            ) : (
              rewards.slice(0, 5).map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{reward.name}</p>
                    <p className="text-xs text-gray-500">{reward.type.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">{reward.pointsCost.toLocaleString()} pts</p>
                    <p className="text-xs text-gray-500">{reward.timesRedeemed} canjes</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transacciones recientes */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Actividad Reciente
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Puntos</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No hay transacciones aún
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => {
                  const user = userMap.get(tx.account.userId);
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{user?.name || 'Usuario'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[tx.type] || 'bg-gray-100'}`}>
                          {typeLabels[tx.type] || tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tx.description}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={tx.points > 0 ? 'text-green-600' : 'text-red-600'}>
                          {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString('es-MX')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
