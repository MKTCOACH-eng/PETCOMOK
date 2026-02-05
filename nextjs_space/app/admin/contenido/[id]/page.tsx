import { notFound } from 'next/navigation';
import { ArticleForm } from '../article-form';
import prisma from '@/lib/db';

interface PageProps {
  params: { id: string };
}

export default async function EditarContenidoPage({ params }: PageProps) {
  const [article, products] = await Promise.all([
    prisma.article.findUnique({ where: { id: params.id } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, imageUrl: true },
      orderBy: { name: 'asc' }
    })
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Contenido</h1>
      <ArticleForm article={article} products={products} />
    </div>
  );
}
