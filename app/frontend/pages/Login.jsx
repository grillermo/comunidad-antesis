import { useForm } from '@inertiajs/react'

export default function Login({ alert }) {
  const form = useForm({ user: { email: '', password: '', remember_me: false } })

  const submit = (e) => {
    e.preventDefault()
    form.post('/users/sign_in')
  }

  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
          Manual del Color Vivo
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-blue">Iniciar sesión</h1>

        {alert && (
          <p role="alert" className="mt-4 text-sm text-orange-ink">{alert}</p>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.data.user.email}
              onChange={(e) => form.setData('user', { ...form.data.user, email: e.target.value })}
              className="w-full border border-blue/20 bg-white px-3 py-3 text-[15px] outline-none focus:border-orange"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.data.user.password}
              onChange={(e) => form.setData('user', { ...form.data.user, password: e.target.value })}
              className="w-full border border-blue/20 bg-white px-3 py-3 text-[15px] outline-none focus:border-orange"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.data.user.remember_me}
              onChange={(e) => form.setData('user', { ...form.data.user, remember_me: e.target.checked })}
            />
            Recordarme
          </label>

          <button
            type="submit"
            disabled={form.processing}
            className="font-display bg-orange px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            Entrar
          </button>

          <a href="/users/password/new" className="text-sm text-blue underline">
            ¿Olvidaste tu contraseña?
          </a>
        </form>
      </div>
    </main>
  )
}
