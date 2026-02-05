export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Aceptación de Términos</h2>
            <p className="text-gray-600">
              Al acceder y utilizar el sitio web de PETCOM, usted acepta estar sujeto a estos términos y condiciones de uso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Uso del Sitio</h2>
            <p className="text-gray-600">
              Este sitio web está destinado exclusivamente para uso personal y no comercial. Usted se compromete a no utilizar este sitio para ningún propósito ilegal o prohibido por estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Productos y Precios</h2>
            <p className="text-gray-600">
              Los precios mostrados en el sitio están expresados en Pesos Mexicanos (MXN) e incluyen IVA. Nos reservamos el derecho de modificar precios sin previo aviso. En caso de error en el precio, nos comunicaremos con usted antes de procesar el pedido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cuenta de Usuario</h2>
            <p className="text-gray-600">
              Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Notifíquenos inmediatamente si sospecha de cualquier uso no autorizado de su cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Propiedad Intelectual</h2>
            <p className="text-gray-600">
              Todo el contenido de este sitio, incluyendo textos, gráficos, logos, imágenes y software, es propiedad de PETCOM y está protegido por las leyes de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitación de Responsabilidad</h2>
            <p className="text-gray-600">
              PETCOM no será responsable por daños indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar este sitio o los productos adquiridos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contacto</h2>
            <p className="text-gray-600">
              Para cualquier duda sobre estos términos, contáctenos en <a href="mailto:hola@petcom.mx" className="text-[#7baaf7] hover:underline">hola@petcom.mx</a>.
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
