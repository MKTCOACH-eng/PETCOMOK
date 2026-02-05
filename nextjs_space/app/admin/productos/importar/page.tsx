'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileSpreadsheet, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ImportProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const data = parseCSV(text);
      setPreview(data.slice(0, 5));
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const products = parseCSV(text);

      const res = await fetch('/api/admin/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setResult(data);
      if (data.created > 0 && data.errors.length === 0) {
        setTimeout(() => router.push('/admin/productos'), 2000);
      }
    } catch (error) {
      setResult({ created: 0, errors: [error instanceof Error ? error.message : 'Error desconocido'] });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'name',
      'description',
      'price',
      'compareAtPrice',
      'costPrice',
      'category',
      'petTypes',
      'stock',
      'sku',
      'barcode',
      'weight',
      'featured',
      'isActive',
      'tags',
      'taxRate',
      'taxIncluded',
      'imageUrl'
    ];
    
    const example = [
      'Alimento Premium Perros',
      'Descripción del producto',
      '599.00',
      '699.00',
      '350.00',
      'perros',
      'dog',
      '50',
      'ALI-001',
      '7501234567890',
      '5000',
      'true',
      'true',
      'premium,natural',
      '16',
      'true',
      'https://ejemplo.com/imagen.jpg'
    ];

    const csv = [headers.join(','), example.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    a.click();
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a productos
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar Productos</h1>
        <p className="text-gray-600">Carga productos en masa usando un archivo CSV</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Instrucciones
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Descarga la plantilla CSV con el formato correcto</li>
          <li>Llena los datos de tus productos (una fila por producto)</li>
          <li>La columna "category" debe ser el slug: perros, gatos, mascotas-pequenas, aves, accesorios</li>
          <li>Los "petTypes" pueden ser: dog, cat, small, bird (separados por coma)</li>
          <li>Guarda el archivo y súbelo aquí</li>
        </ol>
        <button
          onClick={downloadTemplate}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar Plantilla CSV
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#7baaf7] transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Haz clic para seleccionar un archivo CSV</p>
          <p className="text-sm text-gray-400">o arrastra y suelta aquí</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {preview.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Vista previa (primeros 5 productos)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).slice(0, 6).map((key) => (
                      <th key={key} className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).slice(0, 6).map((val, j) => (
                        <td key={j} className="px-3 py-2 text-gray-700 truncate max-w-[150px]">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleImport}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-[#7baaf7] hover:bg-[#6999e6] text-white rounded-lg font-medium disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {loading ? 'Importando...' : 'Importar Productos'}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6">
            {result.created > 0 && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  {result.created} productos importados correctamente
                </p>
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">{result.errors.length} errores encontrados</p>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li>...y {result.errors.length - 10} errores más</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
