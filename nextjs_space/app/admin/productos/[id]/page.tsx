import { ProductForm } from '../product-form';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Producto</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
