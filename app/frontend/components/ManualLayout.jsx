import { Link, usePage, Deferred } from '@inertiajs/react'
import CommentThread from './comments/CommentThread'
import CommentsFallback from './comments/CommentsFallback'

export default function ManualLayout({ title, children, hideTitle = false }) {
  const { section, nextPage } = usePage().props

  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/manual-del-color-vivo" className="font-display text-sm font-semibold text-blue-ink">
          ↑ Contenido
        </Link>
        {hideTitle ? null : <h1 className="mt-4 font-display text-3xl font-bold text-orange">{title}</h1>}
        <div className="mt-6 space-y-5 text-[1.05rem] leading-8">{children}</div>
        {nextPage ? (
          <div className="mt-10 text-right">
            <Link href={nextPage.url} className="font-display text-sm font-semibold text-orange-ink">
              {nextPage.title} →
            </Link>
          </div>
        ) : null}
        {section ? (
          <Deferred data="comments" fallback={<CommentsFallback />}>
            <CommentThread section={section} />
          </Deferred>
        ) : null}
      </div>
    </main>
  )
}
