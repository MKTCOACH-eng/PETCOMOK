'use client';

import { useState, useRef } from 'react';
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
  Plus,
  Upload,
  ImageIcon,
  Calendar,
  Search as SearchIcon,
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Code,
  Loader2
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
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'products'>('content');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
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
    // New fields
    metaTitle: article?.metaTitle || '',
    metaDescription: article?.metaDescription || '',
    publishAt: article?.publishAt ? new Date(article.publishAt).toISOString().slice(0, 16) : '',
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
      slug: prev.slug || generateSlug(title),
      metaTitle: prev.metaTitle || title
    }));
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede pesar más de 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    setUploading(true);
    try {
      // Get presigned URL
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          isPublic: true
        })
      });

      if (!presignedRes.ok) throw new Error('Error obteniendo URL de subida');
      const { uploadUrl, cloud_storage_path } = await presignedRes.json();

      // Check if content-disposition is in signed headers
      const signedHeaders = new URL(uploadUrl).searchParams.get('X-Amz-SignedHeaders') || '';
      const headers: Record<string, string> = { 'Content-Type': file.type };
      if (signedHeaders.includes('content-disposition')) {
        headers['Content-Disposition'] = 'attachment';
      }

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: file
      });

      if (!uploadRes.ok) throw new Error('Error subiendo imagen');

      // Get public URL
      const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || 'abacus-hosted-files-prd';
      const region = 'us-east-1';
      const publicUrl = `https://www.apriorit.com/wp-content/uploads/2021/04/AWS_S3_file_storage-03.jpg`;

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Markdown toolbar functions
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newText = formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end);
    
    setFormData(prev => ({ ...prev, content: newText }));
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        publishAt: formData.publishAt ? new Date(formData.publishAt).toISOString() : null,
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link href="/admin/contenido" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Editar' : 'Preview'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {article ? 'Actualizar' : 'Publicar'}
          </button>
        </div>
      </div>

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

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de portada</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="URL de imagen o sube una..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Subir
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          {formData.imageUrl && (
            <div className="mt-3 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, imageUrl: '' })}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
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

      {/* Tabs: Content / SEO / Products */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'content' ? 'text-[#7baaf7] border-b-2 border-[#7baaf7] bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Contenido
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'seo' ? 'text-[#7baaf7] border-b-2 border-[#7baaf7] bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            SEO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'products' ? 'text-[#7baaf7] border-b-2 border-[#7baaf7] bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Productos ({formData.relatedProducts.length})
          </button>
        </div>

        <div className="p-6">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              {/* Markdown Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-gray-200 rounded" title="Negrita">
                  <Bold className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-2 hover:bg-gray-200 rounded" title="Cursiva">
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button type="button" onClick={() => insertMarkdown('## ')} className="p-2 hover:bg-gray-200 rounded" title="Título">
                  <Heading2 className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertMarkdown('> ')} className="p-2 hover:bg-gray-200 rounded" title="Cita">
                  <Quote className="w-4 h-4" />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button type="button" onClick={() => insertMarkdown('- ')} className="p-2 hover:bg-gray-200 rounded" title="Lista">
                  <List className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertMarkdown('1. ')} className="p-2 hover:bg-gray-200 rounded" title="Lista numerada">
                  <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="p-2 hover:bg-gray-200 rounded" title="Enlace">
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertMarkdown('`', '`')} className="p-2 hover:bg-gray-200 rounded" title="Código">
                  <Code className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => insertMarkdown('![alt](', ')')} className="p-2 hover:bg-gray-200 rounded" title="Imagen">
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              <textarea
                ref={contentRef}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={formData.contentType === 'video' 
                  ? 'Describe el contenido del video, puntos clave, etc.' 
                  : 'Escribe el contenido completo del artículo...'
                }
                rows={formData.contentType === 'tip' ? 6 : 16}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500">Usa la barra de herramientas o escribe Markdown directamente</p>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Título</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="Título para buscadores (50-60 caracteres)"
                  maxLength={70}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/70 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Descripción</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Descripción para buscadores (150-160 caracteres)"
                  maxLength={170}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/170 caracteres</p>
              </div>

              {/* Google Preview */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Vista previa en Google:</p>
                <div className="text-[#1a0dab] text-lg hover:underline cursor-pointer">
                  {formData.metaTitle || formData.title || 'Título del artículo'}
                </div>
                <div className="text-green-700 text-sm">petcom.mx/blog/{formData.slug || 'slug-del-articulo'}</div>
                <div className="text-gray-600 text-sm">
                  {formData.metaDescription || formData.excerpt || 'Descripción del artículo que aparecerá en los resultados de búsqueda...'}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Selecciona productos que quieras promocionar en este contenido</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                {products.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleRelatedProduct(product.id)}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      formData.relatedProducts.includes(product.id)
                        ? 'border-[#7baaf7] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative w-full aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                      {product.imageUrl && (
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      )}
                      {formData.relatedProducts.includes(product.id) && (
                        <div className="absolute inset-0 bg-[#7baaf7]/20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-[#7baaf7] rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white rotate-45" />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{product.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categorization & Publishing */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Categorización y Publicación</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Programar publicación
            </label>
            <input
              type="datetime-local"
              value={formData.publishAt}
              onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
            />
          </div>
        </div>

        {/* Publish Options */}
        <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-[#7baaf7] rounded border-gray-300 focus:ring-[#7baaf7]"
            />
            <span className="text-sm text-gray-700">Destacado en portada</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4 text-[#7baaf7] rounded border-gray-300 focus:ring-[#7baaf7]"
            />
            <span className="text-sm text-gray-700">Publicar inmediatamente</span>
          </label>
        </div>

        {formData.publishAt && !formData.published && (
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            📅 Este contenido se publicará automáticamente el {new Date(formData.publishAt).toLocaleString('es-MX')}
          </p>
        )}
      </div>
    </form>
  );
}
