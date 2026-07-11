export default function Recipe({ rendimiento, tiempo, children }) {
  const hasDetails = rendimiento || tiempo

  return (
    <section className={`my-8 grid gap-8 ${hasDetails ? 'md:grid-cols-[12rem_minmax(0,1fr)]' : ''}`}>
      {hasDetails ? (
        <aside className="space-y-5 border-t-2 border-orange pt-4 text-sm leading-6">
          {rendimiento ? (
            <div>
              <h2 className="font-display font-semibold text-orange-ink">Rendimiento</h2>
              <p className="mt-1">{rendimiento}</p>
            </div>
          ) : null}
          {tiempo ? (
            <div>
              <h2 className="font-display font-semibold text-orange-ink">Tiempo</h2>
              <p className="mt-1">{tiempo}</p>
            </div>
          ) : null}
        </aside>
      ) : null}
      <div className="min-w-0">{children}</div>
    </section>
  )
}
