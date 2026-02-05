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
