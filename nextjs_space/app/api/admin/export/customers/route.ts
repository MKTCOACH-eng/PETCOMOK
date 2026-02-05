import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  return user?.isAdmin === true;
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get('format') || 'xlsx';

  const users = await prisma.user.findMany({
    include: {
      orders: {
        select: {
          total: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const data = users.map((user) => {
    const completedOrders = user.orders.filter((o) => o.status !== 'cancelled');
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const lastOrder = completedOrders.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0];

    return {
      ID: user.id,
      Nombre: user.name || 'Sin nombre',
      Email: user.email,
      'Es Admin': user.isAdmin ? 'Sí' : 'No',
      'Fecha Registro': user.createdAt.toLocaleDateString('es-MX'),
      'Total Pedidos': completedOrders.length,
      'Total Gastado': `$${totalSpent.toFixed(2)}`,
      'Último Pedido': lastOrder
        ? lastOrder.createdAt.toLocaleDateString('es-MX')
        : 'Sin pedidos',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="clientes_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="clientes_${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  });
}
