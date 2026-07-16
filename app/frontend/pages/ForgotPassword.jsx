import { useForm } from '@inertiajs/react'

export default function ForgotPassword({ alert, notice }) {
  const form = useForm({ email: '' })

  const submit = (e) => {
    e.preventDefault()
    form.transform((data) => ({ user: data }))
    form.post('/users/password')
  }

  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
          Manual del Color Vivo
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-blue">Recupera tu acceso</h1>
        <p className="mt-2 text-sm text-blue-ink/80">
          Te enviaremos un correo con instrucciones para crear tu contraseña.
        </p>

        {alert && (
          <p role="alert" className="mt-4 text-sm text-orange-ink">{alert}</p>
        )}
        {notice && (
          <p role="status" className="mt-4 text-sm">{notice}</p>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.data.email}
              onChange={(e) => form.setData('email', e.target.value)}
              className="w-full border border-blue/20 bg-white px-3 py-3 text-[15px] outline-none focus:border-orange"
            />
          </div>

          <button
            type="submit"
            disabled={form.processing}
            className="font-display bg-orange px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            Enviar instrucciones
          </button>
        </form>
      </div>
    </main>
  )
}
