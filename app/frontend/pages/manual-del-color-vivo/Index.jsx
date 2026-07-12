import { Link } from '@inertiajs/react'
import TopMenu from '../../components/TopMenu'

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

export default function Index({ contents, user }) {
  return (
    <main className="relative min-h-screen bg-cream font-body text-blue-ink">
      <div className="absolute right-6 top-6">
        <TopMenu user={user} />
      </div>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
          Manual del Color Vivo
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-orange">Índice</h1>
        <div className="mt-8">
          <NodeList nodes={contents} prefix="/manual-del-color-vivo" />
        </div>
      </div>
    </main>
  )
}
