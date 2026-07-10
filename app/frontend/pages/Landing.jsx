import { useForm, router } from '@inertiajs/react'
import coverUrl from '../assets/cover.jpg'

export default function Landing({ subscribed, alreadySubscribed, source, user }) {
  const form = useForm({ email: '', source: source || '' })

  const submit = (e) => {
    e.preventDefault()
    form.post('/newsletter_emails', { preserveScroll: true })
  }

  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-6 py-4 text-sm">
        {user ? (
          <>
            <span className="text-blue-ink/80">Hola, {user.email}</span>
            {user.role === 'admin' && (
              <a href="/antesis-admin" className="font-display font-semibold text-blue">Admin</a>
            )}
            <button
              type="button"
              onClick={() => router.delete('/users/sign_out')}
              className="font-display font-semibold text-orange-ink"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <a href="/users/sign_in" className="font-display font-semibold text-blue">Iniciar sesión</a>
        )}
      </header>
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-8 px-6 md:grid-cols-2">
        {/* Left column */}
        <div className="max-w-md">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
            Manual del Color Vivo
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-blue sm:text-5xl">
            Tiñe, extrae y pinta con lo que da la tierra
          </h1>

          {subscribed ? (
            <p role="status" className="mt-5 text-lg">
              ¡Listo! Te avisaremos y te enviaremos tu descuento.
            </p>
          ) : alreadySubscribed ? (
            <p role="status" className="mt-5 text-lg">
              Ya estás en la lista. ¡Nos vemos pronto!
            </p>
          ) : (
            <>
              <p className="mt-4 text-[15px] leading-relaxed text-blue-ink/90">
                Más de una década de fórmulas para dar color con plantas,
                minerales e insectos. Déjanos tu correo y recibe un descuento
                para el ebook completo.
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
                  Quiero mi descuento
                </button>
              </form>

              {form.errors.email && (
                <p id="email-error" role="alert" className="mt-2 text-sm text-orange-ink">
                  {Array.isArray(form.errors.email) ? form.errors.email[0] : form.errors.email}
                </p>
              )}

              <p className="mt-3 text-xs text-blue-ink/70">
                Sin spam. Solo el descuento y el aviso de lanzamiento.
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
