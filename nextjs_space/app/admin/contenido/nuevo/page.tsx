import { ArticleForm } from '../article-form';
import prisma from '@/lib/db';

export default async function NuevoContenidoPage() {
  // Fetch products for related products selector
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, imageUrl: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Contenido</h1>
      <ArticleForm products={products} />
    </div>
  );
}
