import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getOrCreateLoyaltyAccount, getPointsHistory, getAllTiers, getLoyaltySettings } from '@/lib/loyalty';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const account = await getOrCreateLoyaltyAccount(userId);
    const history = await getPointsHistory(userId, 10);
    const tiers = await getAllTiers();
    const settings = await getLoyaltySettings();

    // Calcular progreso al siguiente nivel
    let nextTier = null;
    let progressToNextTier = 100;
    
    if (account.tier) {
      const currentTierIndex = tiers.findIndex(t => t.id === account.tier?.id);
      if (currentTierIndex < tiers.length - 1) {
        nextTier = tiers[currentTierIndex + 1];
        const pointsNeeded = nextTier.minPoints - account.totalPoints;
        const pointsRange = nextTier.minPoints - (account.tier?.minPoints || 0);
        progressToNextTier = Math.min(100, Math.max(0, ((account.totalPoints - (account.tier?.minPoints || 0)) / pointsRange) * 100));
      }
    } else if (tiers.length > 0) {
      nextTier = tiers[0];
      progressToNextTier = Math.min(100, (account.totalPoints / nextTier.minPoints) * 100);
    }

    return NextResponse.json({
      account,
      history,
      tiers,
      settings,
      nextTier,
      progressToNextTier,
    });
  } catch (error) {
    console.error('Error fetching loyalty account:', error);
    return NextResponse.json({ error: 'Error al obtener cuenta de lealtad' }, { status: 500 });
  }
}
