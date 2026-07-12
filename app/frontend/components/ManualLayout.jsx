import { useEffect } from 'react'
import { Link, usePage, Deferred, router } from '@inertiajs/react'
import CommentThread from './comments/CommentThread'
import CommentsFallback from './comments/CommentsFallback'

// Same 88 page files Vite already chunks — reused here to warm the next
// section's module. import.meta.glob dedupes to the existing chunks.
const pageModules = import.meta.glob('../pages/manual-del-color-vivo/**/*.jsx')

export default function ManualLayout({ title, children, hideTitle = false }) {
  const { section, nextPage } = usePage().props

  useEffect(() => {
    if (!nextPage) return

    const timer = setTimeout(() => {
      router.prefetch(nextPage.url, { method: 'get' }, { cacheFor: '30m' })

      const slugPath = nextPage.url.replace('/manual-del-color-vivo/', '')
      const chunkKey = `../pages/manual-del-color-vivo/${slugPath}.jsx`
      pageModules[chunkKey]?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [nextPage?.url])

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
