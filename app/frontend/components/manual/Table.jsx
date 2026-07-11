export default function Table({ children }) {
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm leading-6">{children}</table>
    </div>
  )
}

export function Th({ children }) {
  return (
    <th className="border-b-2 border-orange px-3 py-2 text-left font-display font-semibold text-orange-ink">
      {children}
    </th>
  )
}

export function Td({ children }) {
  return <td className="border-b border-blue/10 px-3 py-2 align-top">{children}</td>
}
