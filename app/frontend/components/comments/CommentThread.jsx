import CommentForm from './CommentForm'
import CommentNode from './CommentNode'

export default function CommentThread({ comments, section }) {
  return (
    <section className="mt-14 border-t border-blue/20 pt-9" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="font-display text-2xl font-bold text-blue">Conversación</h2>
      <CommentForm section={section} />

      <div className="mt-8 divide-y divide-blue/15">
        {comments.length ? (
          comments.map((comment) => (
            <CommentNode key={comment.id} comment={comment} section={section} />
          ))
        ) : (
          <p className="py-5 text-sm text-blue-ink/65">Todavía no hay comentarios.</p>
        )}
      </div>
    </section>
  )
}
