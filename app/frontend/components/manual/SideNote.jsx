export default function SideNote({ children }) {
  return (
    <aside className="my-6 border-y border-blue/20 py-4 text-sm leading-6 text-blue-ink/75">
      {children}
    </aside>
  )
}
