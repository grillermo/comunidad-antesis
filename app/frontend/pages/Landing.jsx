import { useForm } from '@inertiajs/react'
import coverUrl from '../assets/cover.jpg'
import TopMenu from '../components/TopMenu'

export default function Landing({ subscribed, alreadySubscribed, source, user, manualPath }) {
  const form = useForm({ email: '', source: source || '' })

  const submit = (e) => {
    e.preventDefault()
    form.post('/newsletter_emails', { preserveScroll: true })
  }

  return (
    <main className="flex min-h-screen flex-col bg-cream font-body text-blue-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-end gap-4 px-6 py-4 text-sm">
        {user ? (
          <TopMenu user={user} />
        ) : (
          <a href="/users/sign_in" className="font-display font-semibold text-blue">Iniciar sesión</a>
        )}
      </header>
      <div className="mx-auto grid w-full flex-1 max-w-6xl grid-cols-1 items-center gap-8 px-6 md:grid-cols-2">
        {/* Left column */}
        <div className="max-w-md">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
            Manual del Color Vivo
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-blue sm:text-5xl">
            Tiñe, extrae y pinta con lo que da la tierra
          </h1>

          {user && (
            <div className="mt-6 flex flex-col items-start gap-3 border border-blue/15 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-blue-ink/80">Retoma donde te quedaste.</p>
              <a
                href={manualPath}
                className="font-display shrink-0 bg-orange px-4 py-3 font-semibold text-white"
              >
                Continuar leyendo
              </a>
            </div>
          )}

          {subscribed ? (
            <p role="status" className="mt-5 text-lg">
              ¡Listo! Te avisaremos del lanzamiento.
            </p>
          ) : alreadySubscribed ? (
            <p role="status" className="mt-5 text-lg">
              Ya estás en la lista. ¡Nos vemos pronto!
            </p>
          ) : (
            <>
              <p className="mt-4 text-[15px] leading-relaxed text-blue-ink/90">
                Más de una década de fórmulas para dar color con plantas,
                minerales e insectos, a punto de salir en un solo libro.
                Déjanos tu correo y sé de los primeros en enterarte el día
                del lanzamiento.
              </p>

              <form onSubmit={submit} className="mt-6 flex max-w-sm gap-2" noValidate>
                <div className="flex-1">
                  <label htmlFor="email" className="sr-only">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    aria-invalid={form.errors.email ? 'true' : undefined}
                    aria-describedby={form.errors.email ? 'email-error' : undefined}
                    className="w-full border border-blue/20 bg-white px-3 py-3 text-[15px] outline-none focus:border-orange"
                  />
                </div>
                <button
                  type="submit"
                  disabled={form.processing}
                  className="font-display bg-orange px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                  Avísenme del lanzamiento
                </button>
              </form>

              {form.errors.email && (
                <p id="email-error" role="alert" className="mt-2 text-sm text-orange-ink">
                  {Array.isArray(form.errors.email) ? form.errors.email[0] : form.errors.email}
                </p>
              )}

              <p className="mt-3 text-xs text-blue-ink/70">
                Sin spam. Solo el aviso de lanzamiento.
              </p>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="flex items-center justify-center">
          <img src={coverUrl} alt="Portada de Manual del Color Vivo" className="w-48 sm:w-56" />
        </div>
      </div>
    </main>
  )
}
