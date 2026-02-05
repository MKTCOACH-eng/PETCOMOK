import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Perros', slug: 'perros', description: 'Todo para tu mejor amigo canino' },
  { name: 'Gatos', slug: 'gatos', description: 'Lo mejor para tu felino' },
  { name: 'Mascotas Pequeñas', slug: 'mascotas-pequenas', description: 'Para hamsters, conejos, cuyos y más' },
  { name: 'Aves', slug: 'aves', description: 'Todo para tus amigos emplumados' },
  { name: 'Accesorios', slug: 'accesorios', description: 'Accesorios para todas las mascotas' },
];

const products = [
  {
    name: 'Alimento Premium para Perros',
    description: 'Alimento seco premium formulado con proteínas de alta calidad y nutrientes esenciales para mantener a tu perro sano y lleno de energía. Ideal para perros adultos de todas las razas.',
    price: 549.00,
    imageUrl: 'https://cdn.abacus.ai/images/5f8d775d-f73a-4287-89f6-40343aeb41fb.png',
    categorySlug: 'perros',
    petTypes: ['dog'],
    stock: 50,
    featured: true,
    tags: ['alimento', 'premium', 'perros']
  },
  {
    name: 'Alimento Húmedo para Gatos',
    description: 'Set de latas de alimento húmedo gourmet para gatos. Elaborado con ingredientes naturales y proteínas de alta calidad que tu gato adorará.',
    price: 189.00,
    imageUrl: 'https://cdn.abacus.ai/images/73f598f8-5422-4263-98ff-bbe459919315.png',
    categorySlug: 'gatos',
    petTypes: ['cat'],
    stock: 80,
    featured: true,
    tags: ['alimento', 'húmedo', 'gatos']
  },
  {
    name: 'Cama Ortopédica para Perros',
    description: 'Cama ortopédica de alta calidad con espuma de memoria que brinda el máximo confort y soporte para las articulaciones de tu perro. Ideal para perros grandes y mayores.',
    price: 1299.00,
    imageUrl: 'https://cdn.abacus.ai/images/2e79decd-9780-4cd8-9ad8-f22e8bf43a16.png',
    categorySlug: 'perros',
    petTypes: ['dog'],
    stock: 25,
    featured: true,
    tags: ['cama', 'ortopédica', 'perros']
  },
  {
    name: 'Torre Rascador para Gatos',
    description: 'Torre rascador moderna con múltiples niveles, postes de sisal y plataformas acolchadas. Perfecta para que tu gato juegue, descanse y afile sus uñas.',
    price: 1899.00,
    imageUrl: 'https://cdn.abacus.ai/images/20f9c9a2-5923-45a9-b32a-edafd162b476.png',
    categorySlug: 'gatos',
    petTypes: ['cat'],
    stock: 15,
    featured: true,
    tags: ['rascador', 'torre', 'gatos']
  },
  {
    name: 'Juguete Interactivo para Perros',
    description: 'Juguete duradero de cuerda y pelota para horas de diversión. Perfecto para jugar a buscar y tirar, ayuda a mantener a tu perro activo y entretenido.',
    price: 249.00,
    imageUrl: 'https://cdn.abacus.ai/images/74c07c69-7423-4120-880e-acfe76367ada.png',
    categorySlug: 'perros',
    petTypes: ['dog'],
    stock: 100,
    featured: false,
    tags: ['juguete', 'interactivo', 'perros']
  },
  {
    name: 'Fuente de Agua Automática',
    description: 'Fuente de agua automática con filtro de carbón activado. Mantiene el agua fresca y limpia, estimulando a tu mascota a hidratarse mejor.',
    price: 699.00,
    imageUrl: 'https://cdn.abacus.ai/images/1ba00a51-1467-40d6-a718-f149b9a0d257.png',
    categorySlug: 'accesorios',
    petTypes: ['dog', 'cat'],
    stock: 40,
    featured: true,
    tags: ['agua', 'fuente', 'automática']
  },
  {
    name: 'Set de Cepillos para Perros',
    description: 'Set completo de cepillos profesionales para el cuidado del pelaje de tu perro. Incluye cepillo deslanador, peine y cepillo suave.',
    price: 399.00,
    imageUrl: 'https://cdn.abacus.ai/images/6c52f89f-6e0d-4b78-bcb1-14c1315cd7f4.png',
    categorySlug: 'perros',
    petTypes: ['dog'],
    stock: 60,
    featured: false,
    tags: ['grooming', 'cepillos', 'perros']
  },
  {
    name: 'Arena Premium para Gatos',
    description: 'Arena aglomerante premium con control de olores avanzado. Fácil de limpiar y de larga duración. Tu gato y tu nariz lo agradecerán.',
    price: 329.00,
    imageUrl: 'https://cdn.abacus.ai/images/50100f22-d8e2-41c2-86fe-07fb041a886b.png',
    categorySlug: 'gatos',
    petTypes: ['cat'],
    stock: 70,
    featured: false,
    tags: ['arena', 'premium', 'gatos']
  },
  {
    name: 'Arnés y Correa para Perros',
    description: 'Set de arnés ajustable y correa a juego con diseño colorido. Acolchado para mayor comodidad y con hebillas de seguridad reforzadas.',
    price: 449.00,
    imageUrl: 'https://cdn.abacus.ai/images/b333e2b3-3cff-4670-b9d4-02c55e61d0bb.png',
    categorySlug: 'perros',
    petTypes: ['dog'],
    stock: 45,
    featured: false,
    tags: ['arnés', 'correa', 'perros']
  },
  {
    name: 'Cama Donut para Gatos',
    description: 'Cama ultrasuave estilo donut que brinda sensación de seguridad y calidez. El lugar perfecto para que tu gato se acurruque y duerma plácidamente.',
    price: 599.00,
    imageUrl: 'https://cdn.abacus.ai/images/28126968-c33d-44c2-8182-7dbc5b8a2330.png',
    categorySlug: 'gatos',
    petTypes: ['cat'],
    stock: 35,
    featured: true,
    tags: ['cama', 'donut', 'gatos']
  },
  {
    name: 'Premios Naturales para Perros',
    description: 'Deliciosos premios naturales elaborados con ingredientes orgánicos. Sin conservadores artificiales, perfectos para entrenar o consentir a tu perro.',
    price: 179.00,
    imageUrl: 'https://cdn.abacus.ai/images/562c0103-a393-4ff7-b7e4-0042f17070d1.png',
    categorySlug: 'perros',
    petTypes: ['dog'],
    stock: 90,
    featured: false,
    tags: ['premios', 'natural', 'perros']
  },
  {
    name: 'Transportadora de Viaje',
    description: 'Transportadora aprobada para avión con diseño moderno y funcional. Ventilación de malla, correa ajustable y bolsillos de almacenamiento.',
    price: 899.00,
    imageUrl: 'https://cdn.abacus.ai/images/70d88557-a392-4223-a66b-3a47654ecd88.png',
    categorySlug: 'accesorios',
    petTypes: ['dog', 'cat'],
    stock: 30,
    featured: true,
    tags: ['transportadora', 'viaje', 'avión']
  }
];

const articles = [
  {
    title: '5 Señales de que tu perro necesita más ejercicio',
    slug: '5-senales-perro-necesita-ejercicio',
    content: `¿Tu perro está inquieto o destruye cosas en casa? Podría necesitar más actividad física.

## Las 5 señales principales:

1. **Comportamiento destructivo** - Morder muebles, zapatos o ropa
2. **Ladridos excesivos** - Especialmente cuando está solo
3. **Hiperactividad en casa** - Corre en círculos constantemente
4. **Aumento de peso** - Falta de actividad = sobrepeso
5. **Dificultad para dormir** - Energía acumulada

## ¿Cuánto ejercicio necesita tu perro?

La cantidad depende de la raza y edad:
- **Razas pequeñas**: 30-60 minutos diarios
- **Razas medianas**: 60-90 minutos diarios
- **Razas grandes/activas**: 90-120 minutos diarios

Recuerda siempre adaptar el ejercicio a las capacidades de tu mascota y consultar con tu veterinario.`,
    excerpt: 'Descubre las señales que indican que tu perro necesita más actividad física y cómo ayudarlo.',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    contentType: 'article',
    category: 'health',
    petType: 'perro',
    featured: true,
    published: true,
    tags: ['ejercicio', 'salud', 'perros', 'comportamiento'],
  },
  {
    title: 'Cómo bañar a tu gato sin estrés',
    slug: 'como-banar-gato-sin-estres',
    content: `Los gatos generalmente se bañan solos, pero a veces necesitan nuestra ayuda. Aquí te explicamos cómo hacerlo.

## Preparación antes del baño:

1. Cepilla bien a tu gato para eliminar nudos
2. Prepara todo lo que necesitas antes de comenzar
3. Usa agua tibia, nunca fría ni muy caliente
4. Elige un shampoo especial para gatos

## Durante el baño:

- Habla con voz calmada y tranquila
- Moja gradualmente, empezando por las patas
- Evita mojar la cabeza directamente
- Enjuaga muy bien para eliminar todo el jabón

## Después del baño:

Seca a tu gato con una toalla suave y mantenlo en un lugar cálido hasta que esté completamente seco.`,
    excerpt: 'Guía paso a paso para bañar a tu gato de manera tranquila y efectiva.',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
    contentType: 'tip',
    category: 'grooming',
    petType: 'gato',
    featured: true,
    published: true,
    tags: ['baño', 'grooming', 'gatos', 'cuidado'],
  },
  {
    title: 'Los mejores alimentos para perros senior',
    slug: 'mejores-alimentos-perros-senior',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoDuration: '8:45',
    content: `Cuando tu perro envejece, sus necesidades nutricionales cambian. En este video te explicamos qué buscar en un alimento para perros mayores.

## Características importantes:

- **Proteína de alta calidad** para mantener masa muscular
- **Menos calorías** para evitar el sobrepeso
- **Glucosamina y condroitina** para las articulaciones
- **Omega-3** para la piel y el pelaje
- **Antioxidantes** para el sistema inmune

Consulta siempre con tu veterinario antes de cambiar la dieta de tu mascota.`,
    excerpt: 'Video guía sobre la nutrición adecuada para perros mayores de 7 años.',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    contentType: 'video',
    category: 'nutrition',
    petType: 'perro',
    featured: false,
    published: true,
    tags: ['nutrición', 'senior', 'perros', 'alimento'],
  },
  {
    title: 'Juguetes DIY para gatos: 5 ideas fáciles',
    slug: 'juguetes-diy-gatos-ideas-faciles',
    content: `¡No necesitas gastar mucho para entretener a tu gato! Aquí te compartimos 5 juguetes caseros.

## 1. La caja de cartón mágica
Corta agujeros de diferentes tamaños en una caja y esconde premios dentro.

## 2. Caña de pescar con plumas
Usa un palo, cuerda y plumas para crear horas de diversión.

## 3. Pelota de calcetín
Rellena un calcetín viejo con hierba gatera y ánudalo.

## 4. Túnel de bolsas de papel
Conecta varias bolsas de papel para crear un túnel de exploración.

## 5. Rompecabezas con tubos
Usa tubos de papel higiénico pegados para esconder premios.

¡Tu gato te lo agradecerá!`,
    excerpt: '5 juguetes caseros que puedes hacer con materiales que ya tienes en casa.',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800',
    contentType: 'tip',
    category: 'tips',
    petType: 'gato',
    featured: true,
    published: true,
    tags: ['DIY', 'juguetes', 'gatos', 'manualidades'],
  },
  {
    title: 'Guía completa de vacunación para cachorros',
    slug: 'guia-vacunacion-cachorros',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoDuration: '12:30',
    content: `Las vacunas son esenciales para proteger la salud de tu cachorro. Te explicamos todo lo que necesitas saber.

## Calendario de vacunación:

**6-8 semanas**: Primera dosis de parvovirus y moquillo
**10-12 semanas**: Segunda dosis + hepatitis y parainfluenza  
**14-16 semanas**: Tercera dosis + rabia
**Anualmente**: Refuerzos según indicación veterinaria

## Cuidados post-vacunación:

- Mantén a tu cachorro en reposo 24-48 horas
- Es normal algo de somnolencia
- Evita el contacto con otros perros hasta completar el esquema`,
    excerpt: 'Todo sobre el calendario de vacunas para proteger la salud de tu cachorro.',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    contentType: 'video',
    category: 'health',
    petType: 'perro',
    featured: false,
    published: true,
    tags: ['vacunas', 'cachorros', 'salud', 'veterinario'],
  },
  {
    title: 'Cómo elegir la jaula perfecta para tu hámster',
    slug: 'elegir-jaula-perfecta-hamster',
    content: `Una jaula adecuada es fundamental para el bienestar de tu hámster. Aquí te explicamos qué considerar.

## Tamaño mínimo recomendado:

- **Hámster sirio**: 80x50 cm de base mínimo
- **Hámster enano**: 60x40 cm de base mínimo

## Características importantes:

1. **Barrotes horizontales** para que pueda trepar
2. **Espacio entre barrotes** máximo 1 cm para hámsters enanos
3. **Base profunda** (al menos 10 cm) para el sustrato
4. **Buena ventilación** pero sin corrientes de aire

## Accesorios imprescindibles:

- Rueda de ejercicio (diámetro mínimo 20 cm)
- Casita o refugio
- Bebedero de boquilla
- Comedero pesado (que no vuelque)`,
    excerpt: 'Guía completa para elegir el hogar perfecto para tu pequeño roedor.',
    imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800',
    contentType: 'article',
    category: 'tips',
    petType: 'all',
    featured: false,
    published: true,
    tags: ['hámster', 'jaula', 'mascotas pequeñas', 'cuidados'],
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create categories
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
    console.log(`📁 Created category: ${cat.name}`);
  }

  // Create products
  for (const product of products) {
    const { categorySlug, ...productData } = product;
    await prisma.product.create({
      data: {
        ...productData,
        categoryId: categoryMap[categorySlug],
      },
    });
    console.log(`📦 Created product: ${product.name}`);
  }

  // Create test admin user
  const hashedPassword = await bcrypt.hash('petcom123', 10);
  await prisma.user.create({
    data: {
      email: 'test@petcom.com',
      name: 'Usuario Test',
      password: hashedPassword,
      isAdmin: true,
    },
  });
  console.log('👤 Created test admin user: test@petcom.com / petcom123');

  // Create articles
  for (const article of articles) {
    await prisma.article.create({
      data: article,
    });
    console.log(`📝 Created article: ${article.title}`);
  }

  // Create service categories
  const serviceCategories = [
    { name: 'Veterinarios', slug: 'veterinarios', description: 'Clínicas y consultorios veterinarios', icon: 'Stethoscope', order: 1 },
    { name: 'Estéticas', slug: 'esteticas', description: 'Grooming y estética canina y felina', icon: 'Scissors', order: 2 },
    { name: 'Entrenadores', slug: 'entrenadores', description: 'Entrenamiento y adiestramiento', icon: 'GraduationCap', order: 3 },
    { name: 'Hospedaje', slug: 'hospedaje', description: 'Hoteles y guarderías para mascotas', icon: 'Home', order: 4 },
    { name: 'Paseadores', slug: 'paseadores', description: 'Servicios de paseo y cuidado', icon: 'Dog', order: 5 },
  ];

  for (const cat of serviceCategories) {
    const existing = await prisma.serviceCategory.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.serviceCategory.create({ data: cat });
      console.log(`🏥 Created service category: ${cat.name}`);
    }
  }

  // Create email templates
  const emailTemplates = [
    {
      name: 'Bienvenida',
      description: 'Email de bienvenida para nuevos suscriptores',
      category: 'welcome',
      subject: '🐾 ¡Bienvenido a la familia PETCOM!',
      preheader: 'Gracias por unirte a nuestra comunidad de amantes de mascotas',
      content: `<h1>¡Hola {{nombre}}! 👋</h1>
<p>Nos alegra mucho que te hayas unido a <strong>PETCOM</strong>, la comunidad más grande de amantes de mascotas en México.</p>
<p>Aquí encontrarás:</p>
<ul>
  <li>🛒 Los mejores productos para tu mascota</li>
  <li>💡 Tips y consejos de expertos</li>
  <li>🎁 Ofertas exclusivas para suscriptores</li>
</ul>
<p>Como regalo de bienvenida, usa el código <strong>BIENVENIDO10</strong> para obtener un 10% de descuento en tu primera compra.</p>
<p>¡Que tu mascota sea muy feliz!</p>
<p>El equipo de PETCOM 🐶🐱</p>`
    },
    {
      name: 'Promoción General',
      description: 'Plantilla para promociones y descuentos',
      category: 'promo',
      subject: '🔥 ¡Ofertas especiales para tu mascota!',
      preheader: 'Descuentos increíbles que no puedes dejar pasar',
      content: `<h1>¡Hola {{nombre}}! 🎉</h1>
<p>Tenemos <strong>ofertas especiales</strong> que tu mascota va a amar:</p>
<div style="background: #f0f7ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
  <h2 style="color: #7baaf7; margin: 0;">¡HASTA 30% OFF!</h2>
  <p>En productos seleccionados</p>
</div>
<p>No dejes pasar esta oportunidad. La promoción es por tiempo limitado.</p>
<a href="https://petcom.mx/catalogo" style="display: inline-block; background: #7baaf7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Ver ofertas</a>
<p>¡Gracias por ser parte de PETCOM!</p>`
    },
    {
      name: 'Newsletter Mensual',
      description: 'Boletín mensual con novedades',
      category: 'newsletter',
      subject: '📰 Novedades de PETCOM - {{mes}}',
      preheader: 'Las últimas noticias y productos para tu mascota',
      content: `<h1>¡Hola {{nombre}}! 📬</h1>
<p>Te traemos las novedades del mes:</p>
<h2>🆕 Nuevos Productos</h2>
<p>Descubre los últimos productos que llegaron a nuestra tienda.</p>
<h2>📝 Tips del Mes</h2>
<p>Consejos útiles para el cuidado de tu mascota.</p>
<h2>🎁 Ofertas Especiales</h2>
<p>Promociones exclusivas para nuestros suscriptores.</p>
<a href="https://petcom.mx" style="display: inline-block; background: #7baaf7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Visitar PETCOM</a>
<p>¡Gracias por leernos!</p>`
    },
    {
      name: 'Dueños de Perros',
      description: 'Contenido específico para dueños de perros',
      category: 'segment',
      subject: '🐕 ¡Especial para tu perro!',
      preheader: 'Productos y tips para consentir a tu mejor amigo',
      content: `<h1>¡Hola {{nombre}}! 🐕</h1>
<p>Sabemos cuánto quieres a tu perro, por eso te traemos:</p>
<h2>Productos Destacados para Perros</h2>
<ul>
  <li>Alimentos premium de alta calidad</li>
  <li>Juguetes resistentes y divertidos</li>
  <li>Camas cómodas y ortopédicas</li>
  <li>Accesorios para paseo</li>
</ul>
<a href="https://petcom.mx/catalogo?category=perros" style="display: inline-block; background: #7baaf7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Ver productos para perros</a>
<p>🐾 ¡Tu perro lo merece todo!</p>`
    },
    {
      name: 'Dueños de Gatos',
      description: 'Contenido específico para dueños de gatos',
      category: 'segment',
      subject: '🐱 ¡Especial para tu gato!',
      preheader: 'Todo lo que tu felino necesita',
      content: `<h1>¡Hola {{nombre}}! 🐱</h1>
<p>Los gatos merecen lo mejor, y aquí lo tenemos:</p>
<h2>Productos Destacados para Gatos</h2>
<ul>
  <li>Alimento gourmet y premium</li>
  <li>Torres rascadoras modernas</li>
  <li>Juguetes interactivos</li>
  <li>Arena y accesorios de higiene</li>
</ul>
<a href="https://petcom.mx/catalogo?category=gatos" style="display: inline-block; background: #7baaf7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Ver productos para gatos</a>
<p>🐾 ¡Haz feliz a tu gatito!</p>`
    },
  ];

  for (const template of emailTemplates) {
    const existing = await prisma.emailTemplate.findFirst({ where: { name: template.name } });
    if (!existing) {
      await prisma.emailTemplate.create({ data: template });
      console.log(`📧 Created email template: ${template.name}`);
    }
  }

  // ========================================
  // LOYALTY PROGRAM DATA
  // ========================================
  console.log('🎖️ Seeding loyalty program...');

  // Loyalty Settings
  const existingSettings = await prisma.loyaltySettings.findFirst();
  if (!existingSettings) {
    await prisma.loyaltySettings.create({
      data: {
        pointsPerPeso: 1,
        minPurchaseForPoints: 100,
        pointsExpirationDays: 365,
        signupBonus: 100,
        firstPurchaseBonus: 200,
        reviewBonus: 50,
        referralBonus: 300,
        birthdayBonus: 100,
        isActive: true,
      },
    });
    console.log('⚙️ Created loyalty settings');
  }

  // Loyalty Tiers
  const loyaltyTiers = [
    {
      name: 'Bronce',
      slug: 'bronce',
      minPoints: 0,
      minSpent: 0,
      pointsMultiplier: 1,
      discountPercent: 0,
      freeShipping: false,
      prioritySupport: false,
      earlyAccess: false,
      birthdayBonus: 50,
      color: '#CD7F32',
      sortOrder: 0,
    },
    {
      name: 'Plata',
      slug: 'plata',
      minPoints: 1000,
      minSpent: 2000,
      pointsMultiplier: 1.25,
      discountPercent: 5,
      freeShipping: false,
      prioritySupport: false,
      earlyAccess: false,
      birthdayBonus: 100,
      color: '#C0C0C0',
      sortOrder: 1,
    },
    {
      name: 'Oro',
      slug: 'oro',
      minPoints: 5000,
      minSpent: 10000,
      pointsMultiplier: 1.5,
      discountPercent: 10,
      freeShipping: true,
      prioritySupport: true,
      earlyAccess: false,
      birthdayBonus: 200,
      color: '#FFD700',
      sortOrder: 2,
    },
    {
      name: 'Platino',
      slug: 'platino',
      minPoints: 15000,
      minSpent: 30000,
      pointsMultiplier: 2,
      discountPercent: 15,
      freeShipping: true,
      prioritySupport: true,
      earlyAccess: true,
      birthdayBonus: 500,
      color: '#E5E4E2',
      sortOrder: 3,
    },
  ];

  for (const tier of loyaltyTiers) {
    const existing = await prisma.loyaltyTier.findFirst({ where: { slug: tier.slug } });
    if (!existing) {
      await prisma.loyaltyTier.create({ data: tier });
      console.log(`⭐ Created tier: ${tier.name}`);
    }
  }

  // Loyalty Rewards
  const loyaltyRewards = [
    {
      name: '$50 de descuento',
      description: 'Obtén $50 MXN de descuento en tu próxima compra.',
      type: 'DISCOUNT_FIXED',
      pointsCost: 500,
      value: 50,
      minPurchase: 300,
      validDays: 30,
      isActive: true,
      isFeatured: false,
    },
    {
      name: '10% de descuento',
      description: 'Obtén 10% de descuento en tu próxima compra.',
      type: 'DISCOUNT_PERCENT',
      pointsCost: 800,
      value: 10,
      maxDiscount: 200,
      minPurchase: 500,
      validDays: 30,
      isActive: true,
      isFeatured: true,
    },
    {
      name: '$100 de descuento',
      description: 'Obtén $100 MXN de descuento en tu próxima compra.',
      type: 'DISCOUNT_FIXED',
      pointsCost: 1000,
      value: 100,
      minPurchase: 500,
      validDays: 30,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Envío Gratis',
      description: 'Envío gratis en tu próxima compra sin mínimo de compra.',
      type: 'FREE_SHIPPING',
      pointsCost: 600,
      value: 150,
      validDays: 30,
      isActive: true,
      isFeatured: true,
    },
    {
      name: '20% de descuento',
      description: 'Obtén 20% de descuento en tu próxima compra. ¡Exclusivo!',
      type: 'DISCOUNT_PERCENT',
      pointsCost: 1500,
      value: 20,
      maxDiscount: 500,
      minPurchase: 800,
      validDays: 30,
      isActive: true,
      isFeatured: true,
    },
    {
      name: '$200 de descuento',
      description: 'Obtén $200 MXN de descuento. Ideal para compras grandes.',
      type: 'DISCOUNT_FIXED',
      pointsCost: 2000,
      value: 200,
      minPurchase: 1000,
      validDays: 45,
      isActive: true,
      isFeatured: false,
    },
  ];

  for (const reward of loyaltyRewards) {
    const existing = await prisma.loyaltyReward.findFirst({ where: { name: reward.name } });
    if (!existing) {
      await prisma.loyaltyReward.create({ data: reward });
      console.log(`🎁 Created reward: ${reward.name}`);
    }
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
