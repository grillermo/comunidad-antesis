import { router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import CommentForm from './CommentForm'

function relativeTime(timestamp) {
  const elapsedSeconds = Math.round((new Date(timestamp).getTime() - Date.now()) / 1000)
  const ranges = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  const [unit, seconds] = ranges.find(([, value]) => Math.abs(elapsedSeconds) >= value) || ['second', 1]
  return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
    Math.round(elapsedSeconds / seconds),
    unit,
  )
}

export default function CommentNode({ comment, section, depth = 0 }) {
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const editForm = useForm({ comment: { body: '' } })

  function toggleHeart() {
    router.post(`/comments/${comment.id}/heart`, {}, { preserveScroll: true, only: ['comments'] })
  }

  function beginEdit() {
    editForm.setData('comment', { body: comment.body })
    setEditing(true)
  }

  function submitEdit(event) {
    event.preventDefault()
    editForm.patch(`/comments/${comment.id}`, {
      preserveScroll: true,
      only: ['comments'],
      onSuccess: () => setEditing(false),
    })
  }

  function remove() {
    if (!window.confirm('¿Eliminar este comentario?')) return
    router.delete(`/comments/${comment.id}`, { preserveScroll: true, only: ['comments'] })
  }

  return (
    <article
      className={depth ? 'border-l border-blue/20 pl-4 sm:pl-6' : ''}
      aria-label={comment.deleted ? 'Comentario eliminado' : `Comentario de ${comment.author}`}
    >
      <div className="py-5">
        <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className="max-w-full break-all font-display font-semibold text-blue">
            {comment.deleted ? 'Comentario eliminado' : comment.author}
          </span>
          <time dateTime={comment.created_at} className="text-blue-ink/55">
            {relativeTime(comment.created_at)}
          </time>
          {comment.sticky && (
            <span className="font-display text-xs font-semibold uppercase text-orange-ink">Fijado</span>
          )}
        </header>

        {editing ? (
          <form onSubmit={submitEdit} className="mt-3 space-y-2">
            <label htmlFor={`edit-comment-${comment.id}`} className="sr-only">Editar comentario</label>
            <textarea
              id={`edit-comment-${comment.id}`}
              rows={4}
              autoFocus
              required
              value={editForm.data.comment.body}
              onChange={(event) => editForm.setData('comment', { body: event.target.value })}
              className="w-full resize-y border border-blue/25 bg-white px-3 py-2 text-[15px] leading-6 outline-none focus:border-orange"
            />
            <div className="flex gap-3 text-sm font-semibold">
              <button type="submit" disabled={editForm.processing} className="text-orange-ink disabled:opacity-50">
                Guardar
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-blue-ink/70">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div
            className={`prose prose-sm mt-3 max-w-none text-blue-ink ${comment.deleted ? 'italic opacity-65' : ''}`}
            dangerouslySetInnerHTML={{ __html: comment.body_html }}
          />
        )}

        {!comment.deleted && !editing && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
            <button
              type="button"
              onClick={toggleHeart}
              title={comment.hearted ? 'Quitar corazón' : 'Dar corazón'}
              aria-label={comment.hearted ? 'Quitar corazón' : 'Dar corazón'}
              aria-pressed={comment.hearted}
              className={comment.hearted ? 'text-orange-ink' : 'text-blue-ink/65'}
            >
              <span aria-hidden="true">♥</span> {comment.hearts_count}
            </button>
            <button type="button" onClick={() => setReplying((value) => !value)} className="text-blue-ink/70">
              Responder
            </button>
            {comment.can_edit && (
              <button type="button" onClick={beginEdit} className="text-blue-ink/70">Editar</button>
            )}
            {comment.can_delete && (
              <button type="button" onClick={remove} className="text-orange-ink">Eliminar</button>
            )}
          </div>
        )}

        {replying && <CommentForm section={section} parentId={comment.id} onDone={() => setReplying(false)} />}
      </div>

      {comment.replies?.map((reply) => (
        <CommentNode key={reply.id} comment={reply} section={section} depth={depth + 1} />
      ))}
    </article>
  )
}
