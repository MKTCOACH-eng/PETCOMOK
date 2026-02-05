'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';

interface ImportResult {
  success: number;
  errors: { row: number; email: string; error: string }[];
  duplicates: number;
}

export default function ImportarPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [source, setSource] = useState('import');

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if ((char === ',' || char === ';') && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    const text = await selectedFile.text();
    const parsed = parseCSV(text);
    setPreview(parsed.slice(0, 6)); // Show first 6 rows (header + 5 data rows)
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      
      // Skip header row
      const dataRows = parsed.slice(1);
      
      const subscribers = dataRows.map(row => ({
        email: row[0]?.toLowerCase().trim(),
        name: row[1]?.trim() || null,
        source: source,
      })).filter(s => s.email && s.email.includes('@'));

      const res = await fetch('/api/admin/marketing/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscribers }),
      });

      if (!res.ok) throw new Error('Error en la importación');

      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert('Error al importar los suscriptores');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'email,nombre\nexample@email.com,Juan Pérez\notra@email.com,María García';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_suscriptores.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/marketing" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Importar Suscriptores</h1>
          <p className="text-gray-600">Importa tu base de datos desde un archivo CSV</p>
        </div>
      </div>

      {!result ? (
        <>
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Formato del archivo</h3>
            <p className="text-blue-800 text-sm mb-3">
              El archivo CSV debe tener las siguientes columnas en este orden:
            </p>
            <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
              <li><strong>email</strong> (requerido) - Dirección de email del suscriptor</li>
              <li><strong>nombre</strong> (opcional) - Nombre del suscriptor</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-4 flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900"
            >
              <Download className="w-4 h-4" />
              Descargar plantilla CSV
            </button>
          </div>

          {/* Source Selection */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Fuente de importación</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7baaf7]"
            >
              <option value="import">Importación CSV</option>
              <option value="mailchimp">Mailchimp</option>
              <option value="hubspot">HubSpot</option>
              <option value="excel">Excel/Hoja de cálculo</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#7baaf7] transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {file ? (
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-900">Arrastra tu archivo CSV aquí</p>
                  <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Vista previa</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-500">Fila</th>
                      <th className="px-4 py-2 text-left text-gray-500">Email</th>
                      <th className="px-4 py-2 text-left text-gray-500">Nombre</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.map((row, i) => (
                      <tr key={i} className={i === 0 ? 'bg-blue-50 font-medium' : ''}>
                        <td className="px-4 py-2 text-gray-500">{i === 0 ? 'Header' : i}</td>
                        <td className="px-4 py-2">{row[0] || '-'}</td>
                        <td className="px-4 py-2">{row[1] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Mostrando las primeras {preview.length} filas
              </p>
            </div>
          )}

          {/* Import Button */}
          {file && (
            <div className="flex justify-end">
              <button
                onClick={handleImport}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importar Suscriptores
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Results */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center mb-6">
            {result.success > 0 ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
            ) : (
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
            )}
            <h2 className="text-xl font-bold text-gray-900">Importación completada</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{result.success}</p>
              <p className="text-sm text-green-700">Importados exitosamente</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{result.duplicates}</p>
              <p className="text-sm text-yellow-700">Duplicados (omitidos)</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
              <p className="text-sm text-red-700">Errores</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Errores encontrados:</h3>
              <div className="max-h-48 overflow-y-auto bg-red-50 rounded-lg p-3">
                {result.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-700 py-1">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Fila {err.row}: {err.email} - {err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setPreview([]);
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Importar otro archivo
            </button>
            <Link
              href="/admin/marketing/suscriptores"
              className="px-4 py-2 bg-[#7baaf7] text-white rounded-lg hover:bg-[#6b9ae7]"
            >
              Ver suscriptores
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
