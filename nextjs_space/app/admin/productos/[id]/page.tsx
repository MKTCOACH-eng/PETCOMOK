import { ProductForm } from '../product-form';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const [product, categories, suppliers] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Producto</h1>
      <ProductForm categories={categories} suppliers={suppliers} product={product} />
    </div>
  );
}
