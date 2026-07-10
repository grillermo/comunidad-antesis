namespace :manual do
  desc "Generate placeholder Inertia page stubs for every Manual section (idempotent)"
  task generate_stubs: :environment do
    root = Rails.root.join("app/frontend/pages/manual-del-color-vivo")
    template = <<~JSX
      import ManualLayout from '@/components/ManualLayout'

      // Placeholder page. Prose is transcribed in a later content pass.
      export default function Page({ title }) {
        return (
          <ManualLayout title={title}>
            <p className="text-blue-ink/60">Contenido próximamente.</p>
          </ManualLayout>
        )
      }
    JSX

    created = 0
    Manual.walk do |_node, path|
      file = root.join("#{path.join('/')}.jsx")
      next if file.exist?
      FileUtils.mkdir_p(file.dirname)
      File.write(file, template)
      created += 1
    end
    puts "Created #{created} stub(s); #{Manual.paths.size} paths total."
  end
end
