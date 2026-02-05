export default function AvisoPrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Aviso de Privacidad</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Responsable del Tratamiento</h2>
            <p className="text-gray-600">
              PETCOM, con domicilio en Ciudad de México, México, es responsable del tratamiento de sus datos personales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Datos que Recopilamos</h2>
            <p className="text-gray-600">Recopilamos los siguientes datos personales:</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Nombre completo</li>
              <li>• Correo electrónico</li>
              <li>• Dirección de envío</li>
              <li>• Número telefónico</li>
              <li>• Información de pago (procesada de forma segura por terceros)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Finalidades del Tratamiento</h2>
            <p className="text-gray-600">Utilizamos sus datos para:</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Procesar y enviar sus pedidos</li>
              <li>• Comunicarnos con usted sobre su cuenta o pedidos</li>
              <li>• Enviar promociones y novedades (con su consentimiento)</li>
              <li>• Mejorar nuestros servicios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Derechos ARCO</h2>
            <p className="text-gray-600">
              Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, envíe un correo a <a href="mailto:privacidad@petcom.mx" className="text-[#7baaf7] hover:underline">privacidad@petcom.mx</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Seguridad</h2>
            <p className="text-gray-600">
              Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado.
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-4 border-t border-gray-100">
            Última actualización: Febrero 2026
          </p>
        </div>
      </div>
    </div>
  );
}
