import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'

export default function TopMenu({ user }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!user) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Menú de usuario"
        className="font-display text-lg font-semibold leading-none text-blue-ink"
      >
        ⋮
      </button>
      {open ? (
        <div className="absolute right-0 z-10 mt-2 min-w-40 border border-blue-ink/15 bg-white py-1 shadow-md">
          {user.role === 'admin' ? (
            <a
              href="/antesis-admin"
              className="block px-4 py-2 text-sm font-display font-semibold text-blue-ink hover:bg-cream"
            >
              Panel de administración
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => router.delete('/users/sign_out')}
            className="block w-full px-4 py-2 text-left text-sm font-display font-semibold text-blue-ink hover:bg-cream"
          >
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  )
}
