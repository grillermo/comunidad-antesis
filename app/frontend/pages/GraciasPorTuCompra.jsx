export default function GraciasPorTuCompra({ email, manualPath }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream font-body text-blue-ink">
      <div className="max-w-md px-6 text-center">
        <h1 className="font-display text-3xl font-bold text-blue">¡Gracias por tu compra!</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-blue-ink/90">
          En unos minutos recibirás en <strong>{email}</strong> tu ejemplar del
          Manual del Color Vivo en PDF. También puedes descargarlo o leerlo en
          línea ahora mismo.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <a
            href="/generate-pdf"
            className="font-display bg-orange px-4 py-3 font-semibold text-white"
          >
            Descargar el manual
          </a>
          <a href={manualPath} className="font-display font-semibold text-blue underline">
            Leer el manual en la web
          </a>
        </div>
      </div>
    </main>
  )
}
