export default function Steps({ children }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-xl font-semibold text-blue">Procedimiento</h2>
      <ol className="mt-4 list-decimal space-y-4 pl-6 marker:font-display marker:font-semibold marker:text-orange-ink">
        {children}
      </ol>
    </section>
  )
}
