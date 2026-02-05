import { SupplierForm } from '../supplier-form';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function EditSupplierPage({ params }: Props) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
  });

  if (!supplier) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Proveedor</h1>
      <SupplierForm supplier={supplier} />
    </div>
  );
}
