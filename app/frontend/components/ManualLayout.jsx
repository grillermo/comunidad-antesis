import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'

// Shared wrapper for every manual section page. In development a `pdfPages`
// shared prop (array of page numbers) may be present; when it is, we render a
// dev-only two-column view: source PDF pages on the left, content on the right.
// Outside development the prop is never sent, so this renders exactly the
// original single-column layout.
function Content({ title, hideTitle, children }) {
  return (
    <>
      <Link href="/manual-del-color-vivo" className="font-display text-sm font-semibold text-orange-ink">
        ← Contenido
      </Link>
      {hideTitle ? null : <h1 className="mt-4 font-display text-3xl font-bold text-blue">{title}</h1>}
      <div className="mt-6 space-y-5 text-[1.05rem] leading-8">{children}</div>
    </>
  )
}

export default function ManualLayout({ title, children, hideTitle = false }) {
  const { pdfPages } = usePage().props
  const [showPdf, setShowPdf] = useState(true)

  if (!pdfPages || pdfPages.length === 0) {
    return (
      <main className="min-h-screen bg-cream font-body text-blue-ink">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Content title={title} hideTitle={hideTitle}>{children}</Content>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className={`grid ${showPdf ? 'grid-cols-[1fr_1fr]' : 'grid-cols-1'}`}>
        {showPdf && (
          <aside className="max-h-screen overflow-y-auto border-r border-blue/15 bg-blue/5 p-4">
            <button
              type="button"
              onClick={() => setShowPdf(false)}
              className="mb-4 rounded bg-blue px-3 py-1 font-display text-xs font-semibold text-cream"
            >
              Ocultar PDF
            </button>
            <div className="space-y-4">
              {pdfPages.map((n) => (
                <img
                  key={n}
                  src={`/dev/manual_pdf_pages/${n}.png`}
                  alt={`PDF página ${n}`}
                  className="w-full border border-blue/20 bg-white shadow-sm"
                />
              ))}
            </div>
          </aside>
        )}
        <div className="max-h-screen overflow-y-auto px-6 py-12">
          <div className="mx-auto max-w-3xl">
            {!showPdf && (
              <button
                type="button"
                onClick={() => setShowPdf(true)}
                className="mb-4 rounded bg-orange px-3 py-1 font-display text-xs font-semibold text-orange-ink"
              >
                Mostrar PDF
              </button>
            )}
            <Content title={title} hideTitle={hideTitle}>{children}</Content>
          </div>
        </div>
      </div>
    </main>
  )
}
