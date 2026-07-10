import ManualLayout from '@/components/ManualLayout'

// Placeholder page. Prose is transcribed in a later content pass.
export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p className="text-blue-ink/60">Contenido próximamente.</p>
    </ManualLayout>
  )
}
