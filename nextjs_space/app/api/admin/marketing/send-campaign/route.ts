import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

const ABACUS_API_URL = 'https://apps.abacus.ai/api/sendNotificationEmail';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true }
  });
  return user?.isAdmin === true;
}

function generateCampaignHTML(content: string, subscriberName: string | null, includeUnsubscribe: boolean) {
  const personalizedContent = content.replace(/\{\{nombre\}\}/g, subscriberName || 'Amigo/a');
  
  const PETCOM_COLORS = {
    primary: '#7baaf7',
    secondary: '#4285f4',
    dark: '#1a365d'
  };

  const LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Petco_Logo.svg/3840px-Petco_Logo.svg.png';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, ${PETCOM_COLORS.primary} 0%, ${PETCOM_COLORS.secondary} 100%); padding: 30px; text-align: center;">
                  <img src="${LOGO_URL}" alt="PETCOM" style="max-width: 180px; height: auto;">
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${personalizedContent.split('\n').map(line => 
                    line.trim() ? `<p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.6;">${line}</p>` : '<br>'
                  ).join('')}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: ${PETCOM_COLORS.dark}; padding: 25px 30px; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px;">
                    PETCOM - Todo para tu mascota 🐾
                  </p>
                  <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                    hola@petcom.mx | www.petcom.mx
                  </p>
                  ${includeUnsubscribe ? `
                  <p style="margin: 15px 0 0 0; color: #718096; font-size: 11px;">
                    Si no deseas recibir más correos, responde a este email con "BAJA".
                  </p>
                  ` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { subject, preheader, content, includeUnsubscribe } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Asunto y contenido son requeridos' },
        { status: 400 }
      );
    }

    // Get active subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true }
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No hay suscriptores activos' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ABACUSAI_API_KEY;
    const webAppId = process.env.WEB_APP_ID;
    // Use the welcome email notification ID for campaigns
    const notificationId = process.env.NOTIF_ID_EMAIL_DE_BIENVENIDA;

    if (!apiKey || !webAppId || !notificationId) {
      console.error('Missing email configuration');
      return NextResponse.json(
        { error: 'Configuración de email incompleta' },
        { status: 500 }
      );
    }

    let sent = 0;
    let failed = 0;

    // Send emails in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (subscriber) => {
        try {
          const html = generateCampaignHTML(content, subscriber.name, includeUnsubscribe);
          const fullSubject = preheader ? `${subject} - ${preheader}` : subject;

          const response = await fetch(ABACUS_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
            },
            body: JSON.stringify({
              web_app_id: webAppId,
              notification_id: notificationId,
              email: subscriber.email,
              subject: fullSubject,
              body: html,
            }),
          });

          if (response.ok) {
            sent++;
          } else {
            const errorData = await response.json().catch(() => ({}));
            if (errorData.message === 'Notification is disabled') {
              // User disabled notifications, count as failed but don't error
              failed++;
            } else {
              failed++;
              console.error(`Failed to send to ${subscriber.email}:`, errorData);
            }
          }
        } catch (error) {
          failed++;
          console.error(`Error sending to ${subscriber.email}:`, error);
        }
      }));

      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      sent,
      failed,
      total: subscribers.length
    });
  } catch (error) {
    console.error('Campaign send error:', error);
    return NextResponse.json(
      { error: 'Error al enviar la campaña' },
      { status: 500 }
    );
  }
}
