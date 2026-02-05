import prisma from '@/lib/db';

// Obtener o crear cuenta de lealtad para un usuario
export async function getOrCreateLoyaltyAccount(userId: string) {
  let account = await prisma.loyaltyAccount.findUnique({
    where: { userId },
    include: { tier: true },
  });

  if (!account) {
    // Obtener configuración
    const settings = await getLoyaltySettings();
    
    // Crear cuenta con bono de registro
    account = await prisma.loyaltyAccount.create({
      data: {
        userId,
        currentPoints: settings.signupBonus,
        totalPoints: settings.signupBonus,
      },
      include: { tier: true },
    });

    // Registrar transacción del bono
    if (settings.signupBonus > 0) {
      await prisma.pointsTransaction.create({
        data: {
          accountId: account.id,
          type: 'BONUS',
          points: settings.signupBonus,
          description: 'Bono de bienvenida por registro',
          balanceAfter: settings.signupBonus,
          expiresAt: new Date(Date.now() + settings.pointsExpirationDays * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  return account;
}

// Obtener configuración de lealtad
export async function getLoyaltySettings() {
  let settings = await prisma.loyaltySettings.findFirst();
  
  if (!settings) {
    // Crear configuración por defecto
    settings = await prisma.loyaltySettings.create({
      data: {
        pointsPerPeso: 1,
        minPurchaseForPoints: 100,
        pointsExpirationDays: 365,
        signupBonus: 100,
        firstPurchaseBonus: 200,
        reviewBonus: 50,
        referralBonus: 300,
        birthdayBonus: 100,
        isActive: true,
      },
    });
  }
  
  return settings;
}

// Calcular puntos a ganar por una compra
export async function calculatePointsForPurchase(amount: number, userId: string) {
  const settings = await getLoyaltySettings();
  
  if (!settings.isActive || amount < settings.minPurchaseForPoints) {
    return 0;
  }
  
  let points = Math.floor(amount * settings.pointsPerPeso);
  
  // Aplicar multiplicador del nivel
  const account = await prisma.loyaltyAccount.findUnique({
    where: { userId },
    include: { tier: true },
  });
  
  if (account?.tier) {
    points = Math.floor(points * account.tier.pointsMultiplier);
  }
  
  return points;
}

// Otorgar puntos por compra
export async function awardPointsForPurchase(
  userId: string,
  orderId: string,
  amount: number,
  isFirstPurchase: boolean = false
) {
  const settings = await getLoyaltySettings();
  if (!settings.isActive) return null;
  
  const account = await getOrCreateLoyaltyAccount(userId);
  let pointsToAward = await calculatePointsForPurchase(amount, userId);
  
  // Bono primera compra
  if (isFirstPurchase && settings.firstPurchaseBonus > 0) {
    pointsToAward += settings.firstPurchaseBonus;
  }
  
  if (pointsToAward <= 0) return account;
  
  const expiresAt = new Date(Date.now() + settings.pointsExpirationDays * 24 * 60 * 60 * 1000);
  const newBalance = account.currentPoints + pointsToAward;
  
  // Actualizar cuenta
  const updatedAccount = await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: {
      currentPoints: newBalance,
      totalPoints: { increment: pointsToAward },
      totalSpent: { increment: amount },
      totalOrders: { increment: 1 },
    },
    include: { tier: true },
  });
  
  // Registrar transacción
  let description = `Puntos por compra #${orderId.slice(-6).toUpperCase()}`;
  if (isFirstPurchase) {
    description += ` (incluye ${settings.firstPurchaseBonus} pts bono primera compra)`;
  }
  
  await prisma.pointsTransaction.create({
    data: {
      accountId: account.id,
      type: 'EARNED',
      points: pointsToAward,
      description,
      orderId,
      balanceAfter: newBalance,
      expiresAt,
    },
  });
  
  // Verificar si sube de nivel
  await checkAndUpgradeTier(userId);
  
  return updatedAccount;
}

// Canjear puntos por recompensa
export async function redeemReward(userId: string, rewardId: string) {
  const account = await getOrCreateLoyaltyAccount(userId);
  const reward = await prisma.loyaltyReward.findUnique({
    where: { id: rewardId },
  });
  
  if (!reward || !reward.isActive) {
    throw new Error('Recompensa no disponible');
  }
  
  if (account.currentPoints < reward.pointsCost) {
    throw new Error('Puntos insuficientes');
  }
  
  if (reward.maxRedemptions && reward.timesRedeemed >= reward.maxRedemptions) {
    throw new Error('Esta recompensa ya alcanzó su límite de canjes');
  }
  
  const newBalance = account.currentPoints - reward.pointsCost;
  
  // Actualizar cuenta
  await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: { currentPoints: newBalance },
  });
  
  // Registrar transacción
  const transaction = await prisma.pointsTransaction.create({
    data: {
      accountId: account.id,
      type: 'REDEEMED',
      points: -reward.pointsCost,
      description: `Canjeado: ${reward.name}`,
      rewardId: reward.id,
      balanceAfter: newBalance,
    },
  });
  
  // Incrementar contador de canjes
  await prisma.loyaltyReward.update({
    where: { id: rewardId },
    data: { timesRedeemed: { increment: 1 } },
  });
  
  // Generar código de cupón según tipo
  const couponCode = await generateRewardCoupon(reward, userId);
  
  return { transaction, couponCode, reward };
}

// Generar cupón para recompensa canjeada
async function generateRewardCoupon(reward: any, userId: string) {
  const code = `LOYAL-${userId.slice(-4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + reward.validDays * 24 * 60 * 60 * 1000);
  
  let discountType: 'PERCENTAGE' | 'FIXED' = 'FIXED';
  let discountValue = reward.value;
  
  if (reward.type === 'DISCOUNT_PERCENT') {
    discountType = 'PERCENTAGE';
  } else if (reward.type === 'FREE_SHIPPING') {
    discountType = 'FIXED';
    discountValue = 150; // Valor promedio de envío
  }
  
  await prisma.coupon.create({
    data: {
      code,
      discountType,
      discountValue,
      minPurchase: reward.minPurchase,
      maxUses: 1,
      expiresAt,
      isActive: true,
    },
  });
  
  return code;
}

// Verificar y actualizar nivel
export async function checkAndUpgradeTier(userId: string) {
  const account = await prisma.loyaltyAccount.findUnique({
    where: { userId },
    include: { tier: true },
  });
  
  if (!account) return;
  
  const tiers = await prisma.loyaltyTier.findMany({
    where: { isActive: true },
    orderBy: { minPoints: 'desc' },
  });
  
  // Encontrar el nivel más alto que califica
  const qualifiedTier = tiers.find(
    tier => account.totalPoints >= tier.minPoints && account.totalSpent >= tier.minSpent
  );
  
  if (qualifiedTier && qualifiedTier.id !== account.tierId) {
    await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        tierId: qualifiedTier.id,
        tierUpdatedAt: new Date(),
      },
    });
    
    return qualifiedTier;
  }
  
  return null;
}

// Obtener historial de transacciones
export async function getPointsHistory(userId: string, limit = 20) {
  const account = await prisma.loyaltyAccount.findUnique({
    where: { userId },
  });
  
  if (!account) return [];
  
  return prisma.pointsTransaction.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { reward: true },
  });
}

// Obtener recompensas disponibles para un usuario
export async function getAvailableRewards(userId: string) {
  const account = await getOrCreateLoyaltyAccount(userId);
  
  const rewards = await prisma.loyaltyReward.findMany({
    where: {
      isActive: true,
      OR: [
        { maxRedemptions: null },
        { timesRedeemed: { lt: prisma.loyaltyReward.fields.maxRedemptions } },
      ],
    },
    orderBy: { pointsCost: 'asc' },
  });
  
  return rewards.map(reward => ({
    ...reward,
    canRedeem: account.currentPoints >= reward.pointsCost,
    pointsNeeded: Math.max(0, reward.pointsCost - account.currentPoints),
  }));
}

// Obtener todos los niveles
export async function getAllTiers() {
  return prisma.loyaltyTier.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}
