export default function Callout({ children }) {
  return (
    <aside className="my-8 border-l-4 border-orange bg-white/45 px-5 py-4 text-blue-ink">
      <p className="font-display font-semibold text-orange-ink">Importante:</p>
      <div className="mt-2 space-y-3">{children}</div>
    </aside>
  )
}
