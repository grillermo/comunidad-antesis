import { Link } from '@inertiajs/react'

function NodeList({ nodes, prefix }) {
  return (
    <ul className="mt-2 space-y-1 border-l border-blue/15 pl-4">
      {nodes.map((node) => {
        const href = `${prefix}/${node.slug}`
        return (
          <li key={href}>
            <Link href={href} className="text-blue visited:text-orange-ink hover:text-orange">
              {node.title}
            </Link>
            {node.children.length > 0 && <NodeList nodes={node.children} prefix={href} />}
          </li>
        )
      })}
    </ul>
  )
}

export default function Index({ contents }) {
  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
          Manual del Color Vivo
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-blue">Contenido</h1>
        <div className="mt-8">
          <NodeList nodes={contents} prefix="/manual-del-color-vivo" />
        </div>
      </div>
    </main>
  )
}
