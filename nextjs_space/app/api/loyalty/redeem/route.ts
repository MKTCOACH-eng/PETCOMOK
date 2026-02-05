import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redeemReward } from '@/lib/loyalty';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { rewardId } = await request.json();
    
    if (!rewardId) {
      return NextResponse.json({ error: 'ID de recompensa requerido' }, { status: 400 });
    }

    const result = await redeemReward(userId, rewardId);

    return NextResponse.json({
      success: true,
      couponCode: result.couponCode,
      reward: result.reward,
      message: `¡Has canjeado "${result.reward.name}"! Tu código de cupón es: ${result.couponCode}`,
    });
  } catch (error: any) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json({ error: error.message || 'Error al canjear recompensa' }, { status: 400 });
  }
}
