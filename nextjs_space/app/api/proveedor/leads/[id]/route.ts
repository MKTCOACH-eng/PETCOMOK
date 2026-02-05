import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'petcom-provider-secret';

function getProviderFromToken(request: NextRequest) {
  const token = request.cookies.get('provider_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { providerId: string };
    return decoded.providerId;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const providerId = getProviderFromToken(request);
    if (!providerId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { status, notes } = body;

    // Verificar que el lead pertenece al proveedor
    const lead = await prisma.serviceLead.findFirst({
      where: { id: params.id, providerId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'contacted' && !lead.contactedAt) {
        updateData.contactedAt = new Date();
      }
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (!lead.viewedAt) {
      updateData.viewedAt = new Date();
    }

    const updatedLead = await prisma.serviceLead.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Error al actualizar lead' }, { status: 500 });
  }
}
