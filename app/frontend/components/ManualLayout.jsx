import { Link, usePage } from '@inertiajs/react'
import CommentThread from './comments/CommentThread'

export default function ManualLayout({ title, children, hideTitle = false }) {
  const { comments, section } = usePage().props

  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/manual-del-color-vivo" className="font-display text-sm font-semibold text-orange-ink">
          ← Contenido
        </Link>
        {hideTitle ? null : <h1 className="mt-4 font-display text-3xl font-bold text-blue">{title}</h1>}
        <div className="mt-6 space-y-5 text-[1.05rem] leading-8">{children}</div>
        {comments && section ? <CommentThread comments={comments} section={section} /> : null}
      </div>
    </main>
  )
}
