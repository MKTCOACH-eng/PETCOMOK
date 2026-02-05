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

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const format = req.nextUrl.searchParams.get('format') || 'xlsx';
    const from = req.nextUrl.searchParams.get('from');
    const to = req.nextUrl.searchParams.get('to');

    const where: Record<string, unknown> = {};
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, Date>).gte = new Date(from);
      if (to) (where.createdAt as Record<string, Date>).lte = new Date(to);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = orders.map((o) => ({
      'Número Pedido': o.id.slice(-8).toUpperCase(),
      Fecha: new Date(o.createdAt).toLocaleDateString('es-MX'),
      Hora: new Date(o.createdAt).toLocaleTimeString('es-MX'),
      Cliente: o.user.name || o.user.email,
      Email: o.user.email,
      Estado: statusLabels[o.status] || o.status,
      Subtotal: o.subtotal,
      Descuento: o.discount,
      Total: o.total,
      'Código Cupón': o.couponCode || '',
      Productos: o.items.map(i => `${i.product.name} x${i.quantity}`).join('; '),
      'Nombre Envío': o.shippingName || '',
      'Dirección': o.shippingAddress || '',
      'Teléfono': o.shippingPhone || '',
      'Email Envío': o.shippingEmail || '',
    }));

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="pedidos_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    ws['!cols'] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 25 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 50 },
      { wch: 25 },
      { wch: 40 },
      { wch: 15 },
      { wch: 30 },
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="pedidos_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting orders:', error);
    return NextResponse.json({ error: 'Error al exportar pedidos' }, { status: 500 });
  }
}
