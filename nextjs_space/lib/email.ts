// Email utility functions for PETCOM

const PETCOM_COLORS = {
  primary: '#7baaf7',
  secondary: '#e67c73',
  dark: '#1a1a2e',
};

const LOGO_URL = 'https://i.pinimg.com/736x/e6/e8/af/e6e8af5566a1aee3ef9fef8f327960cd.jpg';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  notificationId: string;
}

export async function sendEmail({ to, subject, body, notificationId }: EmailOptions) {
  try {
    const appUrl = process.env.NEXTAUTH_URL || '';
    const appName = 'PETCOM';

    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: notificationId,
        subject,
        body,
        is_html: true,
        recipient_email: to,
        sender_email: appUrl ? `noreply@${new URL(appUrl).hostname}` : 'noreply@petcom.mx',
        sender_alias: appName,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      if (result.notification_disabled) {
        console.log('Notification disabled by user, skipping email');
        return { success: true, disabled: true };
      }
      console.error('Email send failed:', result.message);
      return { success: false, error: result.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: 'Error sending email' };
  }
}

// Email template wrapper
function emailWrapper(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, ${PETCOM_COLORS.primary} 0%, ${PETCOM_COLORS.secondary} 100%); padding: 30px; text-align: center;">
                  <img src="${LOGO_URL}" alt="PETCOM" style="max-width: 180px; height: auto;" />
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: ${PETCOM_COLORS.dark}; padding: 25px; text-align: center;">
                  <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">
                    Tu tienda premium de productos para mascotas
                  </p>
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    © 2026 PETCOM. Todos los derechos reservados.
                  </p>
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

// Welcome email
export function generateWelcomeEmail(userName: string) {
  const content = `
    <h1 style="color: ${PETCOM_COLORS.dark}; margin: 0 0 20px; font-size: 28px;">
      ¡Bienvenido a PETCOM, ${userName}! 🐾
    </h1>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Gracias por unirte a nuestra comunidad de amantes de las mascotas. Estamos emocionados de tenerte con nosotros.
    </p>
    <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h3 style="color: ${PETCOM_COLORS.primary}; margin: 0 0 15px; font-size: 18px;">
        ¿Qué puedes hacer ahora?
      </h3>
      <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Explora nuestro catálogo de productos premium</li>
        <li>Descubre ofertas exclusivas para miembros</li>
        <li>Agrega a tus mascotas a tu perfil para recomendaciones personalizadas</li>
      </ul>
    </div>
    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXTAUTH_URL || 'https://petcom.mx'}/catalogo" 
         style="display: inline-block; background-color: ${PETCOM_COLORS.primary}; color: #ffffff; 
                text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Ver Catálogo
      </a>
    </div>
    <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
      ¿Tienes preguntas? Contáctanos en hola@petcom.mx
    </p>
  `;
  return emailWrapper(content);
}

// Order confirmation email for customer
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface OrderDetails {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  shippingAddress?: string;
}

export function generateOrderConfirmationEmail(order: OrderDetails) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;" />` : ''}
          <div>
            <p style="margin: 0; font-weight: 600; color: ${PETCOM_COLORS.dark};">${item.name}</p>
            <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Cantidad: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: ${PETCOM_COLORS.dark};">
        $${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </td>
    </tr>
  `).join('');

  const content = `
    <h1 style="color: ${PETCOM_COLORS.dark}; margin: 0 0 10px; font-size: 28px;">
      ¡Gracias por tu compra! 🎉
    </h1>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
      Hola ${order.customerName}, hemos recibido tu pedido y lo estamos preparando.
    </p>
    
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px 20px; margin-bottom: 25px;">
      <p style="margin: 0; color: #166534; font-weight: 600;">
        Número de pedido: #${order.orderId.slice(-8).toUpperCase()}
      </p>
    </div>

    <h3 style="color: ${PETCOM_COLORS.dark}; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid ${PETCOM_COLORS.primary}; padding-bottom: 10px;">
      Resumen del pedido
    </h3>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      ${itemsHtml}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
        <td style="padding: 8px 0; text-align: right; color: #4b5563;">
          $${order.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </td>
      </tr>
      ${order.discount > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: #059669;">Descuento</td>
          <td style="padding: 8px 0; text-align: right; color: #059669;">-$${order.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
        </tr>
      ` : ''}
      <tr>
        <td style="padding: 15px 0; font-size: 18px; font-weight: bold; color: ${PETCOM_COLORS.dark}; border-top: 2px solid #e5e7eb;">Total</td>
        <td style="padding: 15px 0; text-align: right; font-size: 18px; font-weight: bold; color: ${PETCOM_COLORS.primary}; border-top: 2px solid #e5e7eb;">
          $${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </td>
      </tr>
    </table>

    ${order.shippingAddress ? `
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 25px;">
        <h4 style="color: ${PETCOM_COLORS.dark}; margin: 0 0 10px; font-size: 16px;">
          📦 Dirección de envío
        </h4>
        <p style="color: #4b5563; margin: 0; line-height: 1.6;">
          ${order.shippingAddress}
        </p>
      </div>
    ` : ''}

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXTAUTH_URL || 'https://petcom.mx'}/pedidos" 
         style="display: inline-block; background-color: ${PETCOM_COLORS.primary}; color: #ffffff; 
                text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Ver mis pedidos
      </a>
    </div>

    <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 25px;">
      Te notificaremos cuando tu pedido sea enviado.
    </p>
  `;
  return emailWrapper(content);
}

// Admin new order notification
export function generateAdminOrderNotificationEmail(order: OrderDetails & { customerEmail: string }) {
  const content = `
    <h1 style="color: ${PETCOM_COLORS.dark}; margin: 0 0 20px; font-size: 24px;">
      📦 Nuevo Pedido Recibido
    </h1>
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px 20px; margin-bottom: 25px;">
      <p style="margin: 0; color: #92400e; font-weight: 600;">
        Pedido #${order.orderId.slice(-8).toUpperCase()} - $${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      <tr>
        <td style="padding: 10px 0; color: #6b7280;">Cliente:</td>
        <td style="padding: 10px 0; font-weight: 600; color: ${PETCOM_COLORS.dark};">${order.customerName}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #6b7280;">Email:</td>
        <td style="padding: 10px 0; color: ${PETCOM_COLORS.primary};">${order.customerEmail}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #6b7280;">Productos:</td>
        <td style="padding: 10px 0; color: ${PETCOM_COLORS.dark};">${order.items.length} producto(s)</td>
      </tr>
    </table>

    <h4 style="color: ${PETCOM_COLORS.dark}; margin: 20px 0 10px;">Productos:</h4>
    <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
      ${order.items.map(item => `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</li>`).join('')}
    </ul>

    ${order.shippingAddress ? `
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin-top: 20px;">
        <strong>Enviar a:</strong><br/>
        ${order.shippingAddress}
      </div>
    ` : ''}

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXTAUTH_URL || 'https://petcom.mx'}/admin/pedidos" 
         style="display: inline-block; background-color: ${PETCOM_COLORS.secondary}; color: #ffffff; 
                text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Ver en Admin
      </a>
    </div>
  `;
  return emailWrapper(content);
}
