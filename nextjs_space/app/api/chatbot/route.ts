import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build messages array for the AI
    const messages = [
      { role: 'system', content: context || getDefaultContext() },
    ];

    // Add conversation history
    if (history && Array.isArray(history)) {
      history.forEach((msg: ChatMessage) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', await response.text());
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Error processing message' },
      { status: 500 }
    );
  }
}

function getDefaultContext(): string {
  return `Eres PetBot, el asistente virtual de PETCOM, una tienda premium de productos para mascotas en México.
Responde siempre en español de México, de forma amigable y profesional. Usa emojis ocasionalmente (🐕 🐱 🐾 💝).

Información de la tienda:
- Envío gratis en compras mayores a $799 MXN
- 30 días para devoluciones
- Horario: Lunes a Viernes 9am-6pm
- Email: hola@petcom.mx
- Tel: +52 55 1234 5678
- Ubicación: CDMX, México

Categorías disponibles:
- Perros: alimentos premium, juguetes, collares, correas, camas, ropa
- Gatos: alimentos, juguetes, rascadores, camas, arena
- Aves: alpiste, jaulas, accesorios
- Pequeñas mascotas: alimento para roedores, hábitats, accesorios

Siempre sé útil y responde de forma concisa. No des diagnósticos médicos, recomienda ir al veterinario para temas de salud.
Si te preguntan por productos específicos, menciona que pueden explorar el catálogo en la tienda.`;
}
