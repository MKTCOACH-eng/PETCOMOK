import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { CouponForm } from '../coupon-form';

export const dynamic = 'force-dynamic';

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const coupon = await prisma.coupon.findUnique({
    where: { id: params.id },
  });

  if (!coupon) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Cupón</h1>
      <CouponForm coupon={coupon} />
    </div>
  );
}
