import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { Metadata } from 'next';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  User, 
  Tag,
  Video,
  FileText,
  Lightbulb,
  Share2,
  ChevronRight
} from 'lucide-react';
import { ProductCard } from '@/components/product-card';

export const dynamic = 'force-dynamic';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug }
  });

  if (!article) {
    return { title: 'Artículo no encontrado | PETCOM' };
  }

  return {
    title: article.metaTitle || article.title + ' | PETCOM Blog',
    description: article.metaDescription || article.excerpt || 'Lee este artículo en el blog de PETCOM',
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || '',
      images: article.imageUrl ? [article.imageUrl] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || '',
      images: article.imageUrl ? [article.imageUrl] : [],
    }
  };
}

const contentTypeLabels: Record<string, string> = {
  article: 'Artículo',
  video: 'Video',
  tip: 'Tip'
};

const contentTypeIcons: Record<string, any> = {
  article: FileText,
  video: Video,
  tip: Lightbulb
};

const categoryLabels: Record<string, string> = {
  general: 'General',
  tips: 'Tips & Consejos',
  nutrition: 'Nutrición',
  health: 'Salud',
  grooming: 'Grooming',
  training: 'Entrenamiento'
};

interface PageProps {
  params: { slug: string };
}

export default async function ArticlePage({ params }: PageProps) {
  // Fetch article
  const article = await prisma.article.findUnique({
    where: { slug: params.slug }
  });

  // Check if article is published or scheduled to publish
  const isPublished = article?.published || 
    (article?.publishAt && new Date(article.publishAt) <= new Date());
  
  if (!article || !isPublished) {
    notFound();
  }

  // Increment view count
  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } }
  });

  // Fetch related products
  let relatedProducts: any[] = [];
  if (article.relatedProducts.length > 0) {
    relatedProducts = await prisma.product.findMany({
      where: { 
        id: { in: article.relatedProducts },
        isActive: true 
      },
      include: { category: true }
    });
  }

  // Fetch related articles (same category or pet type)
  const relatedArticles = await prisma.article.findMany({
    where: {
      published: true,
      id: { not: article.id },
      OR: [
        { category: article.category },
        { petType: article.petType }
      ]
    },
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  const Icon = contentTypeIcons[article.contentType] || FileText;

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const youtubeEmbedUrl = article.videoUrl ? getYouTubeEmbedUrl(article.videoUrl) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#7baaf7]">Inicio</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/blog" className="hover:text-[#7baaf7]">Blog</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 truncate max-w-[200px]">{article.title}</span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              article.contentType === 'video' ? 'bg-red-100 text-red-700' :
              article.contentType === 'tip' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              <Icon className="w-4 h-4" />
              {contentTypeLabels[article.contentType]}
            </span>
            <span className="text-sm text-gray-500">{categoryLabels[article.category]}</span>
            {article.petType && (
              <span className="text-sm text-gray-500 capitalize">• {article.petType}s</span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {article.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {article.author}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date(article.createdAt).toLocaleDateString('es-MX', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {article.viewCount + 1} vistas
            </span>
          </div>
        </header>

        {/* Video Player */}
        {article.contentType === 'video' && youtubeEmbedUrl && (
          <div className="mb-8 aspect-video rounded-2xl overflow-hidden bg-black shadow-xl">
            <iframe
              src={youtubeEmbedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {/* Featured Image (for articles/tips without video) */}
        {article.contentType !== 'video' && article.imageUrl && (
          <div className="mb-8 relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {article.content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ) : <br key={index} />
          ))}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b border-gray-200">
            <Tag className="w-4 h-4 text-gray-400" />
            {article.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/blog?q=${tag}`}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos Recomendados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contenido Relacionado</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((related) => {
                const RelatedIcon = contentTypeIcons[related.contentType] || FileText;
                return (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="group bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors"
                  >
                    <div className="relative h-32 bg-gray-200">
                      {related.imageUrl ? (
                        <Image
                          src={related.imageUrl}
                          alt={related.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <RelatedIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className={`absolute top-2 left-2 p-1.5 rounded ${
                        related.contentType === 'video' ? 'bg-red-500' :
                        related.contentType === 'tip' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}>
                        <RelatedIcon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 group-hover:text-[#7baaf7] line-clamp-2 text-sm">
                        {related.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#7baaf7] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
