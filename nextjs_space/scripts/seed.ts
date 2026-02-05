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

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.pet.deleteMany();
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
