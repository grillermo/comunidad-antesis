import { useForm } from '@inertiajs/react'

export default function ResetPassword({ resetPasswordToken, alert }) {
  const form = useForm({
    reset_password_token: resetPasswordToken,
    password: '',
    password_confirmation: '',
  })

  const submit = (e) => {
    e.preventDefault()
    form.transform((data) => ({ user: data }))
    form.put('/users/password')
  }

  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
          Manual del Color Vivo
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-blue">Crea tu contraseña</h1>

        {alert && (
          <p role="alert" className="mt-4 text-sm text-orange-ink">{alert}</p>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm">Nueva contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.data.password}
              onChange={(e) => form.setData('password', e.target.value)}
              className="w-full border border-blue/20 bg-white px-3 py-3 text-[15px] outline-none focus:border-orange"
            />
          </div>

          <div>
            <label htmlFor="password_confirmation" className="mb-1 block text-sm">Confirma tu contraseña</label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={form.data.password_confirmation}
              onChange={(e) => form.setData('password_confirmation', e.target.value)}
              className="w-full border border-blue/20 bg-white px-3 py-3 text-[15px] outline-none focus:border-orange"
            />
          </div>

          <button
            type="submit"
            disabled={form.processing}
            className="font-display bg-orange px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            Guardar contraseña
          </button>
        </form>
      </div>
    </main>
  )
}
