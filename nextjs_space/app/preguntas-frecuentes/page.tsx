export default function PreguntasFrecuentesPage() {
  const faqs = [
    {
      question: '¿Cuánto tarda en llegar mi pedido?',
      answer: 'Los envíos en la Zona Metropolitana llegan en 24-48 horas hábiles. Para el interior de la República, el tiempo es de 3-5 días hábiles.'
    },
    {
      question: '¿Cómo puedo rastrear mi pedido?',
      answer: 'Una vez que tu pedido sea enviado, recibirás un correo con el número de guía. También puedes ver el estado de tu pedido en la sección "Mis Pedidos" de tu cuenta.'
    },
    {
      question: '¿Cuál es el monto mínimo de compra?',
      answer: 'No hay monto mínimo de compra. Sin embargo, el envío es gratis en compras mayores a $799 MXN.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express). Todos los pagos son procesados de forma segura.'
    },
    {
      question: '¿Puedo cambiar o cancelar mi pedido?',
      answer: 'Puedes solicitar cambios o cancelaciones dentro de las primeras 2 horas después de realizar tu pedido, siempre que no haya sido enviado. Contáctanos a hola@petcom.mx.'
    },
    {
      question: '¿Los productos tienen garantía?',
      answer: 'Sí, ofrecemos 30 días de garantía de satisfacción. Si no estás contento con tu compra, puedes solicitar una devolución.'
    },
    {
      question: '¿Cómo sé qué producto es el adecuado para mi mascota?',
      answer: 'En cada producto encontrarás información detallada sobre para qué tipo de mascota está diseñado. Si tienes dudas, contáctanos y te ayudaremos a elegir.'
    },
    {
      question: '¿Tienen tienda física?',
      answer: 'Actualmente operamos exclusivamente en línea, lo que nos permite ofrecerte los mejores precios y la comodidad de recibir todo en tu casa.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h1>
        <p className="text-gray-600 mb-8">¿Tienes dudas? Aquí encontrarás las respuestas a las preguntas más comunes.</p>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-[#7baaf7]/10 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">¿No encontraste lo que buscabas?</h3>
          <p className="text-gray-600 mb-4">Nuestro equipo está listo para ayudarte.</p>
          <a
            href="mailto:hola@petcom.mx"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7baaf7] text-white font-medium rounded-full hover:bg-[#6999e6] transition-colors"
          >
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  );
}
