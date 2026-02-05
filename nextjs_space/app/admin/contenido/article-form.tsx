'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Video, 
  Lightbulb,
  Eye,
  X,
  Plus
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

interface ArticleFormProps {
  article?: any;
  products: Product[];
}

const contentTypes = [
  { value: 'article', label: 'Artículo', icon: FileText, description: 'Contenido escrito con texto e imágenes' },
  { value: 'video', label: 'Video', icon: Video, description: 'Video de YouTube o Vimeo con descripción' },
  { value: 'tip', label: 'Tip Rápido', icon: Lightbulb, description: 'Consejo breve y útil' }
];

const categories = [
  { value: 'general', label: 'General' },
  { value: 'tips', label: 'Tips & Consejos' },
  { value: 'nutrition', label: 'Nutrición' },
  { value: 'health', label: 'Salud' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'training', label: 'Entrenamiento' }
];

const petTypes = [
  { value: '', label: 'Todas las mascotas' },
  { value: 'perro', label: 'Perros' },
  { value: 'gato', label: 'Gatos' }
];

export function ArticleForm({ article, products }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    imageUrl: article?.imageUrl || '',
    author: article?.author || 'Equipo PETCOM',
    contentType: article?.contentType || 'article',
    videoUrl: article?.videoUrl || '',
    videoDuration: article?.videoDuration || '',
    category: article?.category || 'general',
    petType: article?.petType || '',
    tags: article?.tags?.join(', ') || '',
    relatedProducts: article?.relatedProducts || [],
    featured: article?.featured || false,
    published: article?.published || false,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      };

      const url = article 
        ? `/api/admin/contenido/${article.id}` 
        : '/api/admin/contenido';
      
      const res = await fetch(url, {
        method: article ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al guardar');
      }

      router.push('/admin/contenido');
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRelatedProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      relatedProducts: prev.relatedProducts.includes(productId)
        ? prev.relatedProducts.filter((id: string) => id !== productId)
        : [...prev.relatedProducts, productId]
    }));
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Content Type Selector */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de contenido</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {contentTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, contentType: type.value })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  formData.contentType === type.value
                    ? 'border-[#7baaf7] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${
                  formData.contentType === type.value ? 'text-[#7baaf7]' : 'text-gray-400'
                }`} />
                <p className="font-medium text-gray-900">{type.label}</p>
                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Información Básica</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ej: 10 Tips para cuidar a tu perro en verano"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="10-tips-cuidar-perro-verano"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Extracto / Descripción corta</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Breve descripción que aparecerá en las previews..."
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de portada (URL)</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
          />
          {formData.imageUrl && (
            <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
              <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Video Fields */}
      {formData.contentType === 'video' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-red-500" />
            Configuración de Video
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL del Video *</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              required={formData.contentType === 'video'}
            />
            <p className="text-xs text-gray-500 mt-1">Soporta YouTube y Vimeo</p>
          </div>

          {formData.videoUrl && getYouTubeEmbedUrl(formData.videoUrl) && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={getYouTubeEmbedUrl(formData.videoUrl) || ''}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
            <input
              type="text"
              value={formData.videoDuration}
              onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
              placeholder="Ej: 5:30"
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Contenido</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.contentType === 'video' ? 'Descripción del video' : 'Contenido del artículo'} *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder={formData.contentType === 'video' 
              ? 'Describe el contenido del video, puntos clave, etc.' 
              : 'Escribe el contenido completo del artículo...'
            }
            rows={formData.contentType === 'tip' ? 4 : 12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent font-mono text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Puedes usar Markdown para formatear el texto</p>
        </div>
      </div>

      {/* Categorization */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Categorización</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de mascota</label>
            <select
              value={formData.petType}
              onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
            >
              {petTypes.map(pet => (
                <option key={pet.value} value={pet.value}>{pet.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="perros, verano, cuidados"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Productos Relacionados</h3>
        <p className="text-sm text-gray-500">Selecciona productos que quieras promocionar en este contenido</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
          {products.map(product => (
            <button
              key={product.id}
              type="button"
              onClick={() => toggleRelatedProduct(product.id)}
              className={`p-2 rounded-lg border-2 text-left transition-all ${
                formData.relatedProducts.includes(product.id)
                  ? 'border-[#7baaf7] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="relative w-full h-16 bg-gray-100 rounded mb-2">
                <Image src={product.imageUrl} alt={product.name} fill className="object-contain" />
              </div>
              <p className="text-xs text-gray-700 line-clamp-2">{product.name}</p>
            </button>
          ))}
        </div>
        {formData.relatedProducts.length > 0 && (
          <p className="text-sm text-[#7baaf7]">{formData.relatedProducts.length} productos seleccionados</p>
        )}
      </div>

      {/* Options */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Opciones</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#7baaf7] focus:ring-[#7baaf7]"
            />
            <span className="text-sm text-gray-700">Contenido destacado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#7baaf7] focus:ring-[#7baaf7]"
            />
            <span className="text-sm text-gray-700">Publicar inmediatamente</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <Link
          href="/admin/contenido"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancelar
        </Link>
        <div className="flex gap-3">
          {article && (
            <Link
              href={`/blog/${article.slug}`}
              target="_blank"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              Ver
            </Link>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {article ? 'Actualizar' : 'Crear'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
