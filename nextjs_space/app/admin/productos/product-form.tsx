'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, ArrowLeft, Plus, X, Calculator, Truck, Tag, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  imageUrl: string;
  images: string[];
  categoryId: string;
  petTypes: string[];
  stock: number;
  sku?: string | null;
  barcode?: string | null;
  weight?: number | null;
  featured: boolean;
  isActive: boolean;
  tags: string[];
  taxRate: number;
  taxIncluded: boolean;
  supplierId?: string | null;
  supplierSku?: string | null;
  supplierPrice?: number | null;
  supplierUrl?: string | null;
  marginPercent?: number | null;
  autoSync: boolean;
}

interface Props {
  categories: Category[];
  suppliers: Supplier[];
  product?: Product;
}

const PET_TYPES = [
  { value: 'dog', label: 'Perros' },
  { value: 'cat', label: 'Gatos' },
  { value: 'small', label: 'Mascotas Pequeñas' },
  { value: 'bird', label: 'Aves' },
];

export function ProductForm({ categories, suppliers, product }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'inventory' | 'dropship'>('basic');
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compareAtPrice: product?.compareAtPrice?.toString() || '',
    costPrice: product?.costPrice?.toString() || '',
    imageUrl: product?.imageUrl || '',
    images: product?.images || [],
    categoryId: product?.categoryId || '',
    petTypes: product?.petTypes || [],
    stock: product?.stock?.toString() || '0',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    weight: product?.weight?.toString() || '',
    featured: product?.featured || false,
    isActive: product?.isActive ?? true,
    tags: product?.tags?.join(', ') || '',
    taxRate: product?.taxRate?.toString() || '16',
    taxIncluded: product?.taxIncluded ?? true,
    supplierId: product?.supplierId || '',
    supplierSku: product?.supplierSku || '',
    supplierPrice: product?.supplierPrice?.toString() || '',
    supplierUrl: product?.supplierUrl || '',
    marginPercent: product?.marginPercent?.toString() || '',
    autoSync: product?.autoSync || false,
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  // Calculate margin when supplier price changes
  useEffect(() => {
    if (formData.supplierPrice && formData.price) {
      const cost = parseFloat(formData.supplierPrice);
      const sell = parseFloat(formData.price);
      if (cost > 0 && sell > 0) {
        const margin = ((sell - cost) / sell) * 100;
        setFormData(prev => ({ ...prev, marginPercent: margin.toFixed(2) }));
      }
    }
  }, [formData.supplierPrice, formData.price]);

  // Calculate price from margin
  const calculatePriceFromMargin = () => {
    if (formData.supplierPrice && formData.marginPercent) {
      const cost = parseFloat(formData.supplierPrice);
      const margin = parseFloat(formData.marginPercent);
      if (cost > 0 && margin >= 0 && margin < 100) {
        const price = cost / (1 - margin / 100);
        setFormData(prev => ({ ...prev, price: price.toFixed(2) }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = product
        ? `/api/admin/productos/${product.id}`
        : '/api/admin/productos';
      
      const res = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
          stock: parseInt(formData.stock) || 0,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          taxRate: parseFloat(formData.taxRate) || 16,
          supplierPrice: formData.supplierPrice ? parseFloat(formData.supplierPrice) : null,
          marginPercent: formData.marginPercent ? parseFloat(formData.marginPercent) : null,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          supplierId: formData.supplierId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      router.push('/admin/productos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handlePetTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      petTypes: prev.petTypes.includes(value)
        ? prev.petTypes.filter((t) => t !== value)
        : [...prev.petTypes, value],
    }));
  };

  const addImage = () => {
    if (newImageUrl && !formData.images.includes(newImageUrl)) {
      setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (url: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(i => i !== url) }));
  };

  const tabs = [
    { id: 'basic', label: 'Información', icon: Tag },
    { id: 'pricing', label: 'Precios e Impuestos', icon: DollarSign },
    { id: 'inventory', label: 'Inventario', icon: Calculator },
    { id: 'dropship', label: 'Dropshipping', icon: Truck },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a productos
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-[#7baaf7] border-gray-300 rounded focus:ring-[#7baaf7]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Producto activo (visible en tienda)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Mascota</label>
              <div className="flex flex-wrap gap-2">
                {PET_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                      formData.petTypes.includes(type.value)
                        ? 'bg-[#7baaf7] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.petTypes.includes(type.value)}
                      onChange={() => handlePetTypeChange(type.value)}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen principal *</label>
              <input
                type="url"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                placeholder="https://i.ytimg.com/vi/JeyhJnn0L24/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGEwgEyh_MA8=&rs=AOn4CLDqcQuYoQqCqbbwsHdlLyOc4ygZQw"
              />
              {formData.imageUrl && (
                <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes adicionales</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                  placeholder="URL de imagen adicional"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 group">
                    <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separados por coma)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                placeholder="premium, orgánico, natural"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-[#7baaf7] border-gray-300 rounded focus:ring-[#7baaf7]"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Producto destacado (aparecerá en la página principal)
              </label>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-800 mb-1">💡 Configuración de precios</h4>
              <p className="text-sm text-blue-700">El precio de comparación se mostrará tachado para indicar descuento. Los impuestos se calculan automáticamente.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de venta (MXN) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio comparación <span className="text-gray-400">(tachado)</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                  placeholder="Precio antes del descuento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo del producto</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                  placeholder="Para calcular ganancia"
                />
              </div>
            </div>

            {/* Margin Calculator */}
            {formData.price && formData.costPrice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">📊 Análisis de margen</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-600">Ganancia:</span>
                    <span className="font-bold text-green-800 ml-2">
                      ${(parseFloat(formData.price) - parseFloat(formData.costPrice)).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-600">Margen:</span>
                    <span className="font-bold text-green-800 ml-2">
                      {(((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-green-600">ROI:</span>
                    <span className="font-bold text-green-800 ml-2">
                      {(((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.costPrice)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-5 mt-5">
              <h4 className="font-medium text-gray-900 mb-4">Configuración de impuestos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de IVA (%)</label>
                  <select
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                  >
                    <option value="0">0% - Exento</option>
                    <option value="8">8% - Frontera</option>
                    <option value="16">16% - General</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.taxIncluded}
                      onChange={(e) => setFormData({ ...formData, taxIncluded: e.target.checked })}
                      className="w-4 h-4 text-[#7baaf7] border-gray-300 rounded focus:ring-[#7baaf7]"
                    />
                    <span className="text-sm font-medium text-gray-700">IVA incluido en el precio</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU (código interno)</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                  placeholder="PROD-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de barras</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                  placeholder="EAN/UPC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (gramos)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                  placeholder="500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad en stock *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Productos con stock 0 se mostrarán como "Agotado"</p>
            </div>
          </div>
        )}

        {/* Dropshipping Tab */}
        {activeTab === 'dropship' && (
          <div className="space-y-5">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-purple-800 mb-1">🚀 Modo Dropshipping</h4>
              <p className="text-sm text-purple-700">Configura la información del proveedor para gestionar productos de dropshipping. El margen se calcula automáticamente.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
              >
                <option value="">Sin proveedor (producto propio)</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>

            {formData.supplierId && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU del proveedor</label>
                    <input
                      type="text"
                      value={formData.supplierSku}
                      onChange={(e) => setFormData({ ...formData, supplierSku: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                      placeholder="SKU en catálogo del proveedor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio del proveedor (MXN)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.supplierPrice}
                      onChange={(e) => setFormData({ ...formData, supplierPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL del producto en proveedor</label>
                  <input
                    type="url"
                    value={formData.supplierUrl}
                    onChange={(e) => setFormData({ ...formData, supplierUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                    placeholder="https://proveedor.com/producto"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Calculadora de margen</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Margen deseado (%)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max="99"
                          step="0.1"
                          value={formData.marginPercent}
                          onChange={(e) => setFormData({ ...formData, marginPercent: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7] focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={calculatePriceFromMargin}
                          className="px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6999e6]"
                        >
                          Calcular
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio sugerido</label>
                      <p className="text-2xl font-bold text-[#7baaf7]">
                        {formData.supplierPrice && formData.marginPercent
                          ? `$${(parseFloat(formData.supplierPrice) / (1 - parseFloat(formData.marginPercent) / 100)).toFixed(2)}`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ganancia estimada</label>
                      <p className="text-2xl font-bold text-green-600">
                        {formData.supplierPrice && formData.price
                          ? `$${(parseFloat(formData.price) - parseFloat(formData.supplierPrice)).toFixed(2)}`
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={formData.autoSync}
                    onChange={(e) => setFormData({ ...formData, autoSync: e.target.checked })}
                    className="w-4 h-4 text-[#7baaf7] border-gray-300 rounded focus:ring-[#7baaf7]"
                  />
                  <label htmlFor="autoSync" className="text-sm font-medium text-gray-700">
                    Sincronización automática con proveedor (próximamente)
                  </label>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/productos"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar producto'}
        </button>
      </div>
    </form>
  );
}
