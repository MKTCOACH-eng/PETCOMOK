import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Generate a simple shipping label (in production, this would return the actual PDF from Envia.com)
export async function GET(
  request: Request,
  { params }: { params: { tracking: string } }
) {
  try {
    const trackingNumber = params.tracking;

    const shipment = await prisma.shipment.findFirst({
      where: { trackingNumber },
      include: {
        order: {
          select: {
            id: true,
            shippingName: true,
            shippingAddress: true,
            shippingCity: true,
            shippingState: true,
            shippingZipCode: true,
            shippingPhone: true,
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Envío no encontrado' },
        { status: 404 }
      );
    }

    // Generate HTML label (in production, this would be a PDF from Envia.com)
    const labelHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Etiqueta de Envío - ${trackingNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; }
          .label { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
          .carrier { font-size: 24px; font-weight: bold; }
          .service { font-size: 14px; color: #666; }
          .barcode { text-align: center; margin: 20px 0; padding: 15px; background: #f5f5f5; }
          .tracking { font-size: 20px; font-weight: bold; letter-spacing: 2px; }
          .section { margin-bottom: 15px; }
          .section-title { font-size: 10px; color: #999; text-transform: uppercase; margin-bottom: 5px; }
          .address { font-size: 14px; line-height: 1.5; }
          .from { border-bottom: 1px dashed #ccc; padding-bottom: 15px; }
          .to { font-weight: bold; }
          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ccc; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">
            <div class="carrier">${shipment.carrierName}</div>
            <div class="service">${shipment.serviceName}</div>
          </div>
          
          <div class="barcode">
            <div class="tracking">${trackingNumber}</div>
          </div>
          
          <div class="section from">
            <div class="section-title">Remitente</div>
            <div class="address">
              PETCOM MX<br>
              Av. Insurgentes Sur 1234<br>
              Col. Del Valle, Ciudad de México<br>
              CP 03100<br>
              Tel: 55 5555 1234
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Destinatario</div>
            <div class="address to">
              ${shipment.order?.shippingName || 'N/A'}<br>
              ${shipment.order?.shippingAddress || 'N/A'}<br>
              ${shipment.order?.shippingCity || ''}, ${shipment.order?.shippingState || ''}<br>
              CP ${shipment.order?.shippingZipCode || 'N/A'}<br>
              Tel: ${shipment.order?.shippingPhone || 'N/A'}
            </div>
          </div>
          
          <div class="footer">
            Generado por PETCOM · envia.com<br>
            ${new Date().toLocaleDateString('es-MX')}
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    return new NextResponse(labelHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating label:', error);
    return NextResponse.json(
      { error: 'Error al generar etiqueta' },
      { status: 500 }
    );
  }
}
