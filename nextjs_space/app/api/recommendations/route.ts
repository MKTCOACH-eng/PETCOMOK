import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  petTypes: string[];
  category: { name: string; slug: string };
  tags: string[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    let activePet: Pet | null = null;
    let userId: string | null = null;

    // If logged in, get active pet
    if (session?.user) {
      userId = (session.user as { id: string }).id;
      activePet = await prisma.pet.findFirst({
        where: { userId, isActive: true },
      });
    }

    // Get products based on pet type or featured
    const whereClause: Record<string, unknown> = { isActive: true };
    
    if (activePet) {
      // Map pet type to product filter
      const petTypeMap: Record<string, string> = {
        'perro': 'perros',
        'gato': 'gatos',
        'ave': 'aves',
        'roedor': 'pequenas',
        'pez': 'peces',
        'reptil': 'reptiles',
      };
      const productPetType = petTypeMap[activePet.type.toLowerCase()] || activePet.type.toLowerCase();
      whereClause.petTypes = { has: productPetType };
    }

    // Get products that match the pet type
    let products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    // If not enough products with pet filter, get featured ones
    if (products.length < 6) {
      products = await prisma.product.findMany({
        where: { isActive: true, featured: true },
        include: { category: true },
        take: 12,
      });
    }

    // If we have an active pet, use AI to generate personalized recommendations
    if (activePet && products.length > 0) {
      try {
        const recommendations = await generateAIRecommendations(activePet, products);
        return NextResponse.json({
          pet: activePet,
          products: recommendations,
          personalized: true,
        });
      } catch (aiError) {
        console.error('AI recommendation error:', aiError);
        // Fallback to regular products
      }
    }

    return NextResponse.json({
      pet: activePet,
      products: products.slice(0, 8).map(p => ({
        ...p,
        recommendationReason: activePet 
          ? `Ideal para ${activePet.type}s como ${activePet.name}`
          : 'Producto destacado',
      })),
      personalized: !!activePet,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ error: 'Error al obtener recomendaciones' }, { status: 500 });
  }
}

async function generateAIRecommendations(pet: Pet, products: Product[]) {
  const productList = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description.substring(0, 200),
    price: p.price,
    category: p.category.name,
    tags: p.tags,
  }));

  const prompt = `Eres un experto en productos para mascotas. Basándote en el perfil de la mascota, selecciona los 6 mejores productos y explica brevemente por qué son ideales.

Perfil de la mascota:
- Nombre: ${pet.name}
- Tipo: ${pet.type}
- Raza: ${pet.breed || 'No especificada'}
- Edad: ${pet.age ? `${pet.age} años` : 'No especificada'}
- Peso: ${pet.weight ? `${pet.weight} kg` : 'No especificado'}

Productos disponibles:
${JSON.stringify(productList, null, 2)}

Responde SOLO con JSON válido en este formato exacto (sin markdown, sin bloques de código):
{
  "recommendations": [
    {
      "productId": "id_del_producto",
      "reason": "Razón breve de por qué es ideal para esta mascota (máximo 50 palabras)"
    }
  ]
}`;

  const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error('AI API request failed');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in AI response');
  }

  const parsed = JSON.parse(content);
  const recommendations = parsed.recommendations || [];

  // Map AI recommendations back to full product data
  return recommendations.map((rec: { productId: string; reason: string }) => {
    const product = products.find(p => p.id === rec.productId);
    if (!product) return null;
    return {
      ...product,
      recommendationReason: rec.reason,
    };
  }).filter(Boolean).slice(0, 6);
}
