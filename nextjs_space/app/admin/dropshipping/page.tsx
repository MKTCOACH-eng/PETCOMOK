'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Search, ShoppingCart, TrendingUp, AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';

interface DropshippingStatus {
  configured: boolean;
  supplierId: string | null;
  stats: {
    products: number;
    totalOrders: number;
    pendingOrders: number;
  };
}

interface CJProduct {
  pid: string;
  productName: string;
  productNameEn: string;
  productSku: string;
  productImage: string;
  sellPrice: number;
  categoryName: string;
}

export default function DropshippingPage() {
  const [status, setStatus] = useState<DropshippingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<CJProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null);
  const [margin, setMargin] = useState(50);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/dropshipping/status');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;

    setSearching(true);
    setSearchResults([]);
    setImportResult(null);

    try {
      const res = await fetch('/api/admin/dropshipping/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchKeyword, petOnly: true }),
      });
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleProductSelection = (pid: string) => {
    setSelectedProducts(prev =>
      prev.includes(pid)
        ? prev.filter(id => id !== pid)
        : [...prev, pid]
    );
  };

  const handleImport = async () => {
    if (selectedProducts.length === 0) return;

    setImporting(true);
    try {
      const res = await fetch('/api/admin/dropshipping/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedProducts, margin }),
      });
      const data = await res.json();
      setImportResult({ imported: data.imported, failed: data.failed });
      setSelectedProducts([]);
      fetchStatus(); // Refresh stats
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateSalePrice = (cost: number) => {
    return Math.ceil(cost * (1 + margin / 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dropshipping - CJdropshipping</h1>
          <p className="text-gray-600">Busca e importa productos para mascotas</p>
        </div>
        <a
          href="https://cjdropshipping.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ExternalLink className="h-4 w-4" />
          Panel CJ
        </a>
      </div>

      {/* Status Alert */}
      {!status?.configured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">API no configurada</p>
            <p className="text-sm text-yellow-700 mt-1">
              Necesitas configurar tu API Key de CJdropshipping para buscar e importar productos.
              Contacta al administrador para agregar la variable <code className="bg-yellow-100 px-1 rounded">CJ_API_KEY</code> al sistema.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Productos Dropshipping</p>
              <p className="text-2xl font-bold">{status?.stats.products || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Órdenes Totales</p>
              <p className="text-2xl font-bold">{status?.stats.totalOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendientes de Procesar</p>
              <p className="text-2xl font-bold">{status?.stats.pendingOrders || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Buscar Productos en CJdropshipping</h2>
        
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Buscar productos para mascotas (ej: dog bed, cat toy, pet bowl...)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!status?.configured}
            />
          </div>
          <button
            type="submit"
            disabled={searching || !status?.configured}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Buscar
          </button>
        </form>

        {/* Margin Control */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="text-sm font-medium text-gray-700">Margen de ganancia:</label>
          <input
            type="range"
            min="20"
            max="100"
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm font-bold text-blue-600">{margin}%</span>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">
              Se importaron <strong>{importResult.imported}</strong> productos correctamente.
              {importResult.failed > 0 && ` (${importResult.failed} fallidos)`}
            </p>
          </div>
        )}

        {/* Selected Products Actions */}
        {selectedProducts.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-blue-800">
              <strong>{selectedProducts.length}</strong> producto(s) seleccionado(s)
            </p>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              Importar Seleccionados
            </button>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((product) => (
              <div
                key={product.pid}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedProducts.includes(product.pid)
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleProductSelection(product.pid)}
              >
                <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={product.productImage || '/placeholder.png'}
                    alt={product.productNameEn}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  {selectedProducts.includes(product.pid) && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-2 mb-2">
                  {product.productNameEn || product.productName}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{product.categoryName}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Costo</p>
                    <p className="text-sm font-medium text-gray-600">{formatPrice(product.sellPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Precio venta</p>
                    <p className="text-sm font-bold text-green-600">
                      {formatPrice(calculateSalePrice(product.sellPrice))}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">SKU: {product.productSku}</p>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && !searching && searchKeyword && (
          <p className="text-center text-gray-500 py-8">
            No se encontraron productos. Intenta con otro término de búsqueda.
          </p>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/productos?dropshipping=true"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Ver Productos Dropshipping</p>
              <p className="text-sm text-gray-500">Administrar productos importados</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/pedidos?dropshipping=true"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium">Órdenes Dropshipping</p>
              <p className="text-sm text-gray-500">Procesar órdenes con CJ</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
