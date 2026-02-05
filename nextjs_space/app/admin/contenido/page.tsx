import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { 
  FileText, 
  Video, 
  Lightbulb, 
  Plus, 
  Eye, 
  TrendingUp,
  PenLine,
  Clock
} from 'lucide-react';
import { DeleteArticleButton } from './delete-button';

export const dynamic = 'force-dynamic';

const contentTypeLabels: Record<string, string> = {
  article: 'Artículo',
  video: 'Video',
  tip: 'Tip Rápido'
};

const contentTypeIcons: Record<string, any> = {
  article: FileText,
  video: Video,
  tip: Lightbulb
};

const categoryLabels: Record<string, string> = {
  general: 'General',
  tips: 'Tips',
  nutrition: 'Nutrición',
  health: 'Salud',
  grooming: 'Grooming',
  training: 'Entrenamiento'
};

interface PageProps {
  searchParams: { type?: string; category?: string };
}

export default async function ContenidoPage({ searchParams }: PageProps) {
  const { type, category } = searchParams;

  // Build filter
  const where: any = {};
  if (type) where.contentType = type;
  if (category) where.category = category;

  // Fetch articles
  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  // Stats
  const totalArticles = await prisma.article.count({ where: { contentType: 'article' } });
  const totalVideos = await prisma.article.count({ where: { contentType: 'video' } });
  const totalTips = await prisma.article.count({ where: { contentType: 'tip' } });
  const publishedCount = await prisma.article.count({ where: { published: true } });
  const totalViews = await prisma.article.aggregate({ _sum: { viewCount: true } });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog & Tips</h1>
          <p className="text-gray-600">Gestiona tu contenido: artículos, videos y tips</p>
        </div>
        <Link
          href="/admin/contenido/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Contenido
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalArticles}</p>
              <p className="text-xs text-gray-500">Artículos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Video className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalVideos}</p>
              <p className="text-xs text-gray-500">Videos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalTips}</p>
              <p className="text-xs text-gray-500">Tips</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{(totalViews._sum.viewCount || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Vistas totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/contenido"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !type && !category ? 'bg-[#7baaf7] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </Link>
          <Link
            href="/admin/contenido?type=article"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === 'article' ? 'bg-[#7baaf7] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Artículos
          </Link>
          <Link
            href="/admin/contenido?type=video"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === 'video' ? 'bg-[#7baaf7] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Videos
          </Link>
          <Link
            href="/admin/contenido?type=tip"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === 'tip' ? 'bg-[#7baaf7] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tips
          </Link>
          <div className="w-px bg-gray-300 mx-2" />
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Link
              key={key}
              href={`/admin/contenido?category=${key}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                category === key ? 'bg-[#7baaf7] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {articles.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {articles.map((article) => {
              const Icon = contentTypeIcons[article.contentType] || FileText;
              return (
                <div key={article.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {article.imageUrl ? (
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      {article.contentType === 'video' && article.videoDuration && (
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                          {article.videoDuration}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          article.contentType === 'video' ? 'bg-red-100 text-red-700' :
                          article.contentType === 'tip' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          <Icon className="w-3 h-3" />
                          {contentTypeLabels[article.contentType]}
                        </span>
                        <span className="text-xs text-gray-500">{categoryLabels[article.category] || article.category}</span>
                        {article.featured && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Destacado</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{article.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount} vistas
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(article.createdAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        article.published ? 'bg-green-100 text-green-700' : 
                        article.publishAt && new Date(article.publishAt) > new Date() ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {article.published ? 'Publicado' : 
                         article.publishAt && new Date(article.publishAt) > new Date() ? 
                           `📅 ${new Date(article.publishAt).toLocaleDateString('es-MX')}` : 
                           'Borrador'}
                      </span>
                      <Link
                        href={`/admin/contenido/${article.id}`}
                        className="p-2 text-gray-500 hover:text-[#7baaf7] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <PenLine className="w-4 h-4" />
                      </Link>
                      <DeleteArticleButton articleId={article.id} title={article.title} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No hay contenido aún</h3>
            <p className="text-gray-500 mb-4">Crea tu primer artículo, video o tip</p>
            <Link
              href="/admin/contenido/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Contenido
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
