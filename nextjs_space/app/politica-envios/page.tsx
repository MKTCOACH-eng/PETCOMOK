export default function PoliticaEnviosPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Envíos</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Tiempos de Entrega</h2>
            <p className="text-gray-600">
              Realizamos envíos a toda la República Mexicana. Los tiempos de entrega varían según tu ubicación:
            </p>
            <ul className="mt-3 space-y-2 text-gray-600">
              <li>• <strong>Zona Metropolitana:</strong> 24-48 horas hábiles</li>
              <li>• <strong>Interior de la República:</strong> 3-5 días hábiles</li>
              <li>• <strong>Zonas extendidas:</strong> 5-7 días hábiles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Costos de Envío</h2>
            <p className="text-gray-600">
              El costo de envío se calcula automáticamente al momento del checkout basado en tu código postal y el peso de los productos.
            </p>
            <p className="mt-2 text-[#41b375] font-medium">
              ¡Envío gratis en compras mayores a $799 MXN!
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Seguimiento de Pedido</h2>
            <p className="text-gray-600">
              Una vez que tu pedido sea enviado, recibirás un correo electrónico con el número de guía para que puedas rastrear tu paquete en todo momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">¿Tienes dudas?</h2>
            <p className="text-gray-600">
              Contáctanos en <a href="mailto:hola@petcom.mx" className="text-[#7baaf7] hover:underline">hola@petcom.mx</a> o al teléfono +52 (55) 1234-5678.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
