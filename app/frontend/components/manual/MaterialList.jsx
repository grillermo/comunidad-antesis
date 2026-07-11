export function MaterialList({ children }) {
  return <ul className="my-6 list-disc space-y-4 pl-6 marker:text-orange">{children}</ul>
}

export function Material({ term, children }) {
  return (
    <li className="pl-1 leading-7">
      <strong>{term}</strong>
      {children ? <> — {children}</> : null}
    </li>
  )
}
