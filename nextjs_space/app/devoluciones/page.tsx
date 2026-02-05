export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Devoluciones y Reembolsos</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Garantía de Satisfacción</h2>
            <p className="text-gray-600">
              En PETCOM queremos que tú y tu mascota estén 100% satisfechos. Si por alguna razón no estás contento con tu compra, tienes 30 días para solicitar una devolución.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Condiciones para Devolución</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• El producto debe estar sin abrir y en su empaque original</li>
              <li>• Debes conservar tu comprobante de compra</li>
              <li>• La solicitud debe realizarse dentro de los 30 días posteriores a la entrega</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Productos No Retornables</h2>
            <p className="text-gray-600">
              Por razones de higiene, los siguientes productos no pueden ser devueltos una vez abiertos:
            </p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Alimentos y premios</li>
              <li>• Productos de higiene personal para mascotas</li>
              <li>• Arena para gatos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cómo Solicitar una Devolución</h2>
            <p className="text-gray-600">
              Envía un correo a <a href="mailto:hola@petcom.mx" className="text-[#7baaf7] hover:underline">hola@petcom.mx</a> con tu número de pedido y el motivo de la devolución. Te responderemos en un máximo de 48 horas hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Reembolsos</h2>
            <p className="text-gray-600">
              Una vez aprobada tu devolución y recibido el producto, procesaremos tu reembolso en un plazo de 5-10 días hábiles al método de pago original.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
