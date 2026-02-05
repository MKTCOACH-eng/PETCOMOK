'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { MessageCircle, X, Send, Mic } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
}

interface UserInfo {
  name: string;
  email: string;
  pet: Pet | null;
}

export function PetBotWidget() {
  const { data: session } = useSession() || {};
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Fetch user info and active pet
  useEffect(() => {
    if (session?.user) {
      fetchUserInfo();
    }
  }, [session]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/pets');
      if (res.ok) {
        const pets = await res.json();
        const activePet = pets.find((p: Pet & { isActive: boolean }) => p.isActive) || pets[0] || null;
        setUserInfo({
          name: session?.user?.name || 'Usuario',
          email: session?.user?.email || '',
          pet: activePet,
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Initialize chat with context when opened
  useEffect(() => {
    if (isOpen && !initialized) {
      initializeChat();
    }
  }, [isOpen, initialized, userInfo]);

  const initializeChat = async () => {
    setInitialized(true);
    
    // Build system context based on user info
    let welcomeMessage = '¡Hola! 🐾 Soy PetBot, tu asistente de PETCOM. ';
    
    if (userInfo?.pet) {
      welcomeMessage += `Veo que tienes a **${userInfo.pet.name}**, tu ${userInfo.pet.type.toLowerCase()}`;
      if (userInfo.pet.breed) welcomeMessage += ` ${userInfo.pet.breed}`;
      if (userInfo.pet.age) welcomeMessage += ` de ${userInfo.pet.age} años`;
      welcomeMessage += '. ¿En qué puedo ayudarte hoy con productos para tu compañero? 🐕';
    } else if (userInfo) {
      welcomeMessage += `¡Bienvenido/a ${userInfo.name}! ¿En qué puedo ayudarte hoy? Te recomiendo registrar a tu mascota en "Mis Mascotas" para darte recomendaciones personalizadas. 💝`;
    } else {
      welcomeMessage += '¿En qué puedo ayudarte hoy? Estoy aquí para ayudarte a encontrar los mejores productos para tu mascota. 🐱';
    }
    
    setMessages([{ role: 'bot', content: welcomeMessage }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Build context for the AI
      let systemContext = `Eres PetBot, el asistente virtual de PETCOM, una tienda premium de productos para mascotas en México. 
Responde siempre en español de México, de forma amigable y profesional. Usa emojis ocasionalmente (🐕 🐱 🐾 💝).

Información de la tienda:
- Envío gratis en compras mayores a $799 MXN
- 30 días para devoluciones
- Horario: Lunes a Viernes 9am-6pm
- Email: hola@petcom.mx
- Tel: +52 55 1234 5678

Categorías: Perros, Gatos, Aves, Pequeñas mascotas (roedores)
Productos: alimentos premium, juguetes, accesorios, higiene, camas, transportadoras

No des diagnósticos médicos, recomienda siempre ir al veterinario para temas de salud.
`;

      if (userInfo?.pet) {
        systemContext += `\nINFORMACIÓN DEL CLIENTE:\n- Nombre: ${userInfo.name}\n- Mascota: ${userInfo.pet.name} (${userInfo.pet.type})`;
        if (userInfo.pet.breed) systemContext += `\n- Raza: ${userInfo.pet.breed}`;
        if (userInfo.pet.age) systemContext += `\n- Edad: ${userInfo.pet.age} años`;
        if (userInfo.pet.weight) systemContext += `\n- Peso: ${userInfo.pet.weight} kg`;
        systemContext += `\n\nUsa esta información para dar recomendaciones personalizadas.`;
      }

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: systemContext,
          history: messages.slice(-6), // Last 6 messages for context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: 'Lo siento, hubo un error. ¿Puedes intentar de nuevo? 🙏' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Lo siento, hubo un error de conexión. 🙏' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#e67c73] to-[#f5a89a] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🐾
              </div>
              <div>
                <h3 className="font-bold">PetBot</h3>
                <p className="text-xs text-white/80">Concierge PETCOM</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-[#7baaf7] text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                  }`}
                >
                  {msg.content.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-transparent outline-none text-sm"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-2 bg-[#7baaf7] text-white rounded-full hover:bg-[#5a8fe6] transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {userInfo?.pet && (
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Personalizado para {userInfo.pet.name} 🐾
              </p>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-50 ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-gradient-to-r from-[#e67c73] to-[#f5a89a] hover:shadow-xl'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}
