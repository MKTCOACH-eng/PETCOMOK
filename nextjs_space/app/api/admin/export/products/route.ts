import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import * as XLSX from 'xlsx';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });
  
  return user?.isAdmin === true;
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const format = req.nextUrl.searchParams.get('format') || 'xlsx';

    const products = await prisma.product.findMany({
      include: { category: true, supplier: true },
      orderBy: { createdAt: 'desc' },
    });

    const data = products.map((p) => ({
      ID: p.id,
      SKU: p.sku || '',
      Nombre: p.name,
      Descripción: p.description,
      Categoría: p.category.name,
      'Precio Venta': p.price,
      'Precio Comparación': p.compareAtPrice || '',
      'Precio Costo': p.costPrice || '',
      Stock: p.stock,
      'Tasa IVA': `${p.taxRate}%`,
      'IVA Incluido': p.taxIncluded ? 'Sí' : 'No',
      Destacado: p.featured ? 'Sí' : 'No',
      Activo: p.isActive ? 'Sí' : 'No',
      'Tipo Mascota': p.petTypes.join(', '),
      Tags: p.tags.join(', '),
      Proveedor: p.supplier?.name || '',
      'SKU Proveedor': p.supplierSku || '',
      'Precio Proveedor': p.supplierPrice || '',
      'Margen %': p.marginPercent ? `${p.marginPercent}%` : '',
      'URL Imagen': p.imageUrl,
      'Creado': new Date(p.createdAt).toLocaleDateString('es-MX'),
    }));

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="productos_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default: XLSX
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // ID
      { wch: 15 }, // SKU
      { wch: 40 }, // Nombre
      { wch: 50 }, // Descripción
      { wch: 20 }, // Categoría
      { wch: 12 }, // Precio
      { wch: 12 }, // Precio Comp
      { wch: 12 }, // Costo
      { wch: 8 },  // Stock
      { wch: 10 }, // IVA
      { wch: 12 }, // IVA Inc
      { wch: 10 }, // Destacado
      { wch: 10 }, // Activo
      { wch: 20 }, // Tipo Mascota
      { wch: 25 }, // Tags
      { wch: 20 }, // Proveedor
      { wch: 15 }, // SKU Prov
      { wch: 12 }, // Precio Prov
      { wch: 10 }, // Margen
      { wch: 50 }, // URL
      { wch: 12 }, // Creado
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="productos_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting products:', error);
    return NextResponse.json({ error: 'Error al exportar productos' }, { status: 500 });
  }
}
