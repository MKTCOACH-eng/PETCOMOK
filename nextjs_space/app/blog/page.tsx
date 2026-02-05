import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { 
  FileText, 
  Video, 
  Lightbulb, 
  Clock, 
  Eye,
  ChevronRight,
  Dog,
  Cat,
  Search
} from 'lucide-react';

export const dynamic = 'force-dynamic';

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
  searchParams: { type?: string; category?: string; pet?: string; q?: string };
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { type, category, pet, q } = searchParams;

  // Build filter
  const where: any = { published: true };
  if (type) where.contentType = type;
  if (category) where.category = category;
  if (pet) where.petType = pet;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { excerpt: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } }
    ];
  }

  // Fetch articles
  const articles = await prisma.article.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }]
  });

  // Featured articles
  const featuredArticles = articles.filter(a => a.featured).slice(0, 3);
  const regularArticles = articles.filter(a => !featuredArticles.includes(a));

  // Stats for filters
  const videoCount = await prisma.article.count({ where: { published: true, contentType: 'video' } });
  const tipCount = await prisma.article.count({ where: { published: true, contentType: 'tip' } });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#7baaf7] to-[#4285f4] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog & Tips</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Consejos, guías y videos para cuidar mejor a tu mascota 🐾
          </p>
          
          {/* Search */}
          <form className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={q || ''}
                placeholder="Buscar artículos, videos, tips..."
                className="w-full pl-12 pr-4 py-3 rounded-full text-gray-900 bg-white shadow-lg focus:ring-4 focus:ring-white/30 outline-none"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/blog"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !type && !category && !pet ? 'bg-[#7baaf7] text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Todo
          </Link>
          <Link
            href="/blog?type=video"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              type === 'video' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Video className="w-4 h-4" />
            Videos ({videoCount})
          </Link>
          <Link
            href="/blog?type=tip"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              type === 'tip' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Tips ({tipCount})
          </Link>
          <div className="w-px bg-gray-300 mx-1" />
          <Link
            href="/blog?pet=perro"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              pet === 'perro' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Dog className="w-4 h-4" />
            Perros
          </Link>
          <Link
            href="/blog?pet=gato"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              pet === 'gato' ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Cat className="w-4 h-4" />
            Gatos
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Link
              key={key}
              href={`/blog?category=${key}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                category === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Featured Section */}
        {featuredArticles.length > 0 && !type && !category && !pet && !q && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Destacados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredArticles.map((article, index) => {
                const Icon = contentTypeIcons[article.contentType] || FileText;
                return (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className={`group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all ${
                      index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                    }`}
                  >
                    <div className={`relative ${index === 0 ? 'h-80 md:h-full' : 'h-48'}`}>
                      {article.imageUrl ? (
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#7baaf7] to-[#4285f4] flex items-center justify-center">
                          <Icon className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Video Duration Badge */}
                      {article.contentType === 'video' && article.videoDuration && (
                        <div className="absolute top-4 right-4 bg-black/80 text-white text-sm px-2 py-1 rounded flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {article.videoDuration}
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            article.contentType === 'video' ? 'bg-red-500' :
                            article.contentType === 'tip' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}>
                            <Icon className="w-3 h-3" />
                            {contentTypeLabels[article.contentType]}
                          </span>
                          <span className="text-white/70 text-xs">{categoryLabels[article.category]}</span>
                        </div>
                        <h3 className={`font-bold mb-2 ${index === 0 ? 'text-2xl' : 'text-lg'}`}>
                          {article.title}
                        </h3>
                        {article.excerpt && index === 0 && (
                          <p className="text-white/80 line-clamp-2 text-sm">{article.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Regular Articles Grid */}
        {regularArticles.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {type === 'video' ? 'Videos' : type === 'tip' ? 'Tips' : category ? categoryLabels[category] : 'Todos los contenidos'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => {
                const Icon = contentTypeIcons[article.contentType] || FileText;
                return (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gray-100">
                      {article.imageUrl ? (
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Icon className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <div className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        article.contentType === 'video' ? 'bg-red-500 text-white' :
                        article.contentType === 'tip' ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        <Icon className="w-3 h-3" />
                        {contentTypeLabels[article.contentType]}
                      </div>
                      
                      {/* Video Duration */}
                      {article.contentType === 'video' && article.videoDuration && (
                        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {article.videoDuration}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{categoryLabels[article.category]}</span>
                        {article.petType && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{article.petType}s</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#7baaf7] transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(article.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay contenido aún</h3>
            <p className="text-gray-500">Pronto publicaremos artículos, videos y tips para ti</p>
          </div>
        )}
      </div>
    </div>
  );
}
