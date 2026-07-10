import { Link } from '@inertiajs/react'

// Shared wrapper for every manual section page. Bodies are filled in a later
// content pass; for now pages pass only a title and a placeholder body.
export default function ManualLayout({ title, children }) {
  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/manual-del-color-vivo" className="font-display text-sm font-semibold text-orange-ink">
          ← Contenido
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-blue">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}
