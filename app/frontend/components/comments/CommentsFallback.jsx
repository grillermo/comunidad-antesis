export default function CommentsFallback() {
  return (
    <section className="mt-14 border-t border-blue/20 pt-9" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="font-display text-2xl font-bold text-blue">Conversación</h2>
      <div role="status" aria-label="Cargando conversación" className="mt-8 flex items-center gap-3 py-5">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue/20 border-t-orange motion-reduce:animate-none" />
        <span className="text-sm text-blue-ink/65">Cargando conversación…</span>
      </div>
    </section>
  )
}
