import { useForm } from '@inertiajs/react'

function firstError(error) {
  return Array.isArray(error) ? error[0] : error
}

export default function CommentForm({ section, parentId = null, onDone }) {
  const form = useForm({
    comment: { section_path: section, body: '', parent_id: parentId },
    subscribe: false,
  })

  function submit(event) {
    event.preventDefault()
    form.post('/comments', {
      preserveScroll: true,
      only: ['comments'],
      onSuccess: () => {
        form.reset()
        onDone?.()
      },
    })
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <label className="sr-only" htmlFor={`comment-body-${parentId || 'root'}`}>
        Comentario
      </label>
      <textarea
        id={`comment-body-${parentId || 'root'}`}
        rows={parentId ? 3 : 4}
        required
        className="w-full resize-y border border-blue/25 bg-white px-3 py-2 text-[15px] leading-6 text-blue-ink outline-none focus:border-orange"
        value={form.data.comment.body}
        onChange={(event) => form.setData('comment', {
          ...form.data.comment,
          body: event.target.value,
        })}
        placeholder={parentId ? 'Escribe una respuesta' : 'Escribe un comentario'}
        aria-invalid={form.errors.body ? 'true' : undefined}
      />
      {form.errors.body && (
        <p role="alert" className="text-sm text-orange-ink">{firstError(form.errors.body)}</p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-blue-ink/80">
          <input
            type="checkbox"
            checked={form.data.subscribe}
            onChange={(event) => form.setData('subscribe', event.target.checked)}
            className="border-blue/30 text-blue focus:ring-orange"
          />
          Avísame de respuestas
        </label>
        <div className="flex items-center gap-3">
          {onDone && (
            <button type="button" onClick={onDone} className="text-sm font-semibold text-blue-ink/70">
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={form.processing || !form.data.comment.body.trim()}
            className="bg-orange px-4 py-2 font-display text-sm font-semibold text-white disabled:opacity-50"
          >
            {form.processing ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>
    </form>
  )
}
