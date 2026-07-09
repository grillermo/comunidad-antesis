export default function Welcome({ message }) {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-300">
            comunidad-antesis
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-6xl">
            {message}
          </h1>
        </div>
      </section>
    </main>
  )
}
