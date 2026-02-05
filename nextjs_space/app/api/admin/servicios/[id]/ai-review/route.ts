import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// Helper para verificar admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  return user?.isAdmin === true;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Obtener información del proveedor
    const provider = await prisma.serviceProvider.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: true
      }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    // Preparar el prompt para la IA
    const prompt = `Eres un asistente de validación de negocios para PETCOM, una plataforma de servicios para mascotas en México.

Analiza el siguiente negocio y busca información de reputación online para dar una recomendación de si se debe aprobar o no:

**Información del Negocio:**
- Nombre: ${provider.businessName}
- Categoría: ${provider.category.name}
- Descripción: ${provider.description}
- Ciudad: ${provider.city || 'No especificada'}, ${provider.state || ''}
- Teléfono: ${provider.phone}
- Email: ${provider.email}
- Contacto: ${provider.contactName}

**Tu tarea:**
1. Basándote en la información proporcionada, imagina qué tipo de reviews y reputación podría tener este negocio en plataformas como Google Maps, Facebook, Yelp, etc.
2. Considera factores como:
   - La completitud de la información proporcionada
   - La profesionalidad del nombre y descripción
   - Si la ubicación parece legítima
   - Si el tipo de servicio es coherente con la categoría
3. Genera un análisis realista con:
   - Rating estimado (1-5 estrellas)
   - Número estimado de reviews encontradas
   - Resumen de aspectos positivos
   - Resumen de aspectos negativos o riesgos
   - Recomendación final: APROBAR, RECHAZAR, o REVISAR MANUALMENTE

Responde en formato JSON con esta estructura exacta:
{
  "ratingEstimado": 4.2,
  "numReviewsEstimadas": 15,
  "resumenPositivo": "...",
  "resumenNegativo": "...",
  "factoresDeRiesgo": ["factor1", "factor2"],
  "factoresPositivos": ["factor1", "factor2"],
  "recomendacion": "APROBAR" | "RECHAZAR" | "REVISAR",
  "justificacion": "...",
  "confianzaAnalisis": 75
}

Responde solo con JSON válido, sin bloques de código ni formato adicional.`;

    // Llamar a la API de LLM
    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en análisis de reputación de negocios de servicios para mascotas en México. Respondes siempre en JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!llmResponse.ok) {
      const errorData = await llmResponse.text();
      console.error('LLM API Error:', errorData);
      return NextResponse.json({ error: 'Error al consultar la IA' }, { status: 500 });
    }

    const llmData = await llmResponse.json();
    const content = llmData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No se recibió respuesta de la IA' }, { status: 500 });
    }

    // Parsear la respuesta JSON
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing LLM response:', content);
      return NextResponse.json({ error: 'Error al procesar respuesta de la IA' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        businessName: provider.businessName,
        category: provider.category.name
      },
      analysis
    });

  } catch (error) {
    console.error('Error en AI review:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
