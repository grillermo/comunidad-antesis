export default function Subheading({ as: Tag = 'h2', children }) {
  return <Tag className="mt-10 font-display text-2xl font-semibold text-blue">{children}</Tag>
}
