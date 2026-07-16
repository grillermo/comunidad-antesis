export default function GraciasPorTuCompra({ email, manualPath }) {
  const ownerAccess = email && manualPath

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream font-body text-blue-ink">
      <div className="max-w-md px-6 text-center">
        <h1 className="font-display text-3xl font-bold text-blue">¡Gracias por tu compra!</h1>
        {ownerAccess ? (
          <>
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
          </>
        ) : (
          <>
            <p className="mt-4 text-[15px] leading-relaxed text-blue-ink/90">
              Tu compra fue confirmada. Revisa el correo usado en la compra para
              descargar el manual y usar tu enlace de acceso.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-blue-ink/90">
              Si ya tenías una cuenta y no recuerdas la contraseña, puedes
              recuperarla de forma segura.
            </p>
            <a
              href="/users/password/new"
              className="font-display mt-6 inline-block font-semibold text-blue underline"
            >
              Recuperar mi contraseña
            </a>
          </>
        )}
      </div>
    </main>
  )
}
