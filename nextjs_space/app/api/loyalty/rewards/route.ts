import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getAvailableRewards, getOrCreateLoyaltyAccount } from '@/lib/loyalty';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const rewards = await getAvailableRewards(userId);
    const account = await getOrCreateLoyaltyAccount(userId);

    return NextResponse.json({
      rewards,
      currentPoints: account.currentPoints,
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json({ error: 'Error al obtener recompensas' }, { status: 500 });
  }
}
