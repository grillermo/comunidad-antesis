export default function PartDivider({ image, title, children }) {
  return (
    <section>
      <figure className="overflow-hidden bg-blue">
        <img className="aspect-[4/5] w-full object-cover" src={image} alt="" />
      </figure>
      <h2 className="mt-6 font-display text-3xl font-bold text-blue">{title}</h2>
      {children ? <div className="mt-6 space-y-5 leading-7">{children}</div> : null}
    </section>
  )
}
