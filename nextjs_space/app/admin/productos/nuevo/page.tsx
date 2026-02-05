import { ProductForm } from '../product-form';
import prisma from '@/lib/db';

export default async function NewProductPage() {
  const [categories, suppliers] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Producto</h1>
      <ProductForm categories={categories} suppliers={suppliers} />
    </div>
  );
}
