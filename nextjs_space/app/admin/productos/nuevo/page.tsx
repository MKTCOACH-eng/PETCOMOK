import { ProductForm } from '../product-form';
import prisma from '@/lib/db';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
