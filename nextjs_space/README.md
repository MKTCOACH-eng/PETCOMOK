# PETCOM - Plataforma Premium de E-commerce para Mascotas

![PETCOM Logo](https://petcom.shop/storage/photos/1/peetcom.png)

## 🐾 Descripción

PETCOM es una plataforma SaaS de e-commerce especializada en productos para mascotas, con funcionalidades avanzadas de CRM, personalización con IA, marketplace de servicios y sistema de dropshipping.

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL (Abacus AI Hosted)
- **Storage**: Supabase Storage
- **Autenticación**: NextAuth.js
- **Pagos**: Stripe (preparado para integración)
- **Emails**: Abacus AI Notification API

## 📁 Estructura del Proyecto

```
petcom/
└── nextjs_space/
    ├── app/
    │   ├── admin/           # Panel de administración
    │   ├── api/             # API Routes
    │   ├── auth/            # Páginas de autenticación
    │   ├── catalogo/        # Catálogo de productos
    │   ├── carrito/         # Carrito de compras
    │   ├── checkout/        # Proceso de pago
    │   └── pedidos/         # Historial de pedidos
    ├── components/          # Componentes reutilizables
    ├── lib/                 # Utilidades y configuraciones
    └── prisma/              # Schema de base de datos
```

## 📊 Roadmap de Desarrollo

### FASE 1 - E-commerce Core ✅ (Completada)
- [x] Catálogo de productos con filtros
- [x] Carrito de compras
- [x] Checkout
- [x] Panel Admin completo (Dashboard, Productos, Pedidos, Categorías)
- [x] Import/Export CSV/Excel
- [x] Sistema de proveedores/dropshipping básico
- [ ] Integración Stripe (placeholder configurado)

### FASE 2 - CRM & Comunicación ✅ (Completada)
- [x] Gestión de clientes en admin
- [x] Historial de compras por cliente
- [x] Exportación de datos de clientes
- [x] Email de bienvenida automático
- [x] Email de confirmación de pedido
- [x] Notificación al admin de nuevos pedidos
- [x] CRUD completo de cupones de descuento

### FASE 3 - CMS (Content Management) ⏳ (Pendiente)
- [ ] Blog/Artículos editables desde admin
- [ ] Banners promocionales dinámicos
- [ ] Páginas editables (About, FAQ, etc.)
- [ ] SEO dinámico por página

### FASE 4 - Personalización & IA ⏳ (Pendiente)
- [ ] Registro de mascotas del usuario
- [ ] Recomendaciones IA basadas en tipo/raza/edad de mascota
- [ ] Preferencias personalizadas de compra
- [ ] Dashboard personalizado post-login
- [ ] Alertas de productos según perfil de mascota

### FASE 5 - Concierge & Chatbot ⏳ (Pendiente)
- [ ] Chatbot de dudas integrado (IA)
- [ ] Asistente de compras conversacional
- [ ] Seguimiento de pedidos vía chat
- [ ] Soporte automatizado 24/7

### FASE 6 - Dropshipping Avanzado ⏳ (Pendiente)
- [ ] Integración CJ Dropshipping API
- [ ] Auto-sync inventario/precios
- [ ] Tracking automático de envíos
- [ ] Gestión multi-proveedor

### FASE 7 - Envíos & Logística ⏳ (Pendiente)
- [ ] Integración con compañías de envío (Fedex, DHL, Estafeta)
- [ ] Cálculo automático de costos de envío
- [ ] Generación de guías
- [ ] Tracking en tiempo real
- [ ] Notificaciones de estado de envío

### FASE 8 - Marketplace de Servicios ⏳ (Pendiente)
- [ ] Sección de proveedores/servicios (veterinarios, grooming, entrenadores)
- [ ] Sistema de membresías para proveedores
- [ ] Panel personal para proveedores
- [ ] Sistema de leads para proveedores
- [ ] Reviews y calificaciones de servicios
- [ ] Verificación de proveedores

### FASE 9 - Marketing & Campañas ⏳ (Pendiente)
- [ ] Sistema de campañas de mailing masivas
- [ ] Segmentación de audiencias
- [ ] Templates de email personalizables
- [ ] Análisis de campañas (open rate, clicks)
- [ ] Automatizaciones (carritos abandonados, recurrencia)

### FASE 10 - Engagement & Fidelización ⏳ (Pendiente)
- [ ] Sistema de reseñas de productos
- [ ] Wishlist/Favoritos
- [ ] Programa de lealtad/puntos
- [ ] Referidos
- [ ] Google Analytics 4 integrado

## 🔐 Variables de Entorno

```env
# Base de Datos
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=

# Stripe (configurar por financiero)
STRIPE_PUBLISHABLE_KEY=pk_test_CONFIGURAR_POR_FINANCIERO
STRIPE_SECRET_KEY=sk_test_CONFIGURAR_POR_FINANCIERO

# Emails
ABACUSAI_API_KEY=
WEB_APP_ID=
NOTIF_ID_CONFIRMACIN_DE_PEDIDO=
NOTIF_ID_EMAIL_DE_BIENVENIDA=
NOTIF_ID_NUEVO_PEDIDO_ADMIN=
```

## 🚀 Comandos

```bash
# Instalar dependencias
cd nextjs_space && yarn install

# Desarrollo
yarn dev

# Build
yarn build

# Generar Prisma Client
yarn prisma generate

# Migraciones
yarn prisma db push
```

## 👤 Credenciales de Prueba

- **Admin**: test@petcom.com / petcom123

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Primary Blue | #7baaf7 | Botones, links, acentos |
| Coral | #e67c73 | CTAs secundarios, alertas |
| Dark | #1a1a2e | Textos, headers |
| Light Gray | #F7F8FA | Fondos |

## 📄 Licencia

Propiedad de PETCOM © 2026. Todos los derechos reservados.
