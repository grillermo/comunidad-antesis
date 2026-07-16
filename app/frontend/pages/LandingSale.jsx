import coverUrl from '../assets/cover.jpg'
import TopMenu from '../components/TopMenu'
import Recipe from '../components/manual/Recipe'
import SideNote from '../components/manual/SideNote'
import Steps from '../components/manual/Steps'

function BuyButton({ csrfToken, className = '' }) {
  return (
    <form method="post" action="/checkout" className={className}>
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <button
        type="submit"
        className="font-display w-full bg-orange px-6 py-4 text-lg font-semibold text-white transition hover:bg-orange-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange sm:w-auto"
      >
        Comprar el manual — 30 USD
      </button>
    </form>
  )
}

function ReaderButton({ manualPath, className = '' }) {
  return (
    <a
      href={manualPath}
      className={`font-display inline-block bg-orange px-6 py-4 text-lg font-semibold text-white transition hover:bg-orange-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange ${className}`}
    >
      Continuar leyendo
    </a>
  )
}

function ContentsCard({ chapter, index }) {
  const visibleSections = chapter.children.slice(0, 4)
  const remaining = chapter.children.length - visibleSections.length

  return (
    <li className="border border-blue/10 bg-white/55 p-5 shadow-[0_12px_40px_rgba(25,45,75,0.05)]">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="font-display text-sm font-bold text-orange-ink">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div>
          <h3 className="font-display text-lg font-bold leading-tight text-blue">{chapter.title}</h3>
          {visibleSections.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-blue-ink/75">
              {visibleSections.map((section) => (
                <li key={section.slug}>{section.title}</li>
              ))}
              {remaining > 0 ? <li className="italic">y {remaining} temas más</li> : null}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-blue-ink/65">Capítulo completo</p>
          )}
        </div>
      </div>
    </li>
  )
}

function RecipePreview() {
  return (
    <article className="border border-blue/10 bg-white px-5 py-7 shadow-[0_22px_70px_rgba(25,45,75,0.08)] sm:px-8 lg:px-12">
      <header className="max-w-3xl">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-orange-ink">
          Receta de muestra · Color sobre fibra
        </p>
        <h2 id="recipe-title" className="mt-3 font-display text-3xl font-bold leading-tight text-blue">
          Receta general para teñir con plantas
        </h2>
        <p className="mt-4 leading-7 text-blue-ink/85">
          Esta es la receta que uso como base para teñir con cualquier planta. El procedimiento
          casi siempre es el mismo: extraer el color, filtrar, sumergir la fibra, esperar. Lo que
          cambia de una planta a otra son los tiempos, las cantidades y algunos pequeños detalles.
        </p>
      </header>

      <Recipe tiempo="2.5 a 3.5 horas aproximadamente, 60 minutos activos. Más si el material necesita remojo previo.">
        <Steps>
          <li>Calcula las cantidades. Utiliza 1 gramo de material seco por cada gramo de fibra seca (100% del peso). Si está fresco, usa el doble (200%)</li>
          <li>
            Extrae el color. Calienta el material a fuego bajo por una hora en suficiente agua para
            que quede cubierto. Algunas excepciones:
            <ul className="mt-3 list-disc space-y-3 pl-6 marker:text-orange">
              <li>Pétalos de flores: déjalos solo media hora y vigila que no hierva, porque el color se esfuma u oscurece con mucho calor.</li>
              <li>Materiales muy duros (como la semilla de aguacate): necesitan al menos hora y media para liberar el color.</li>
            </ul>
          </li>
          <li>Filtra el tinte para retirar los sólidos, dejando solo el líquido coloreado.</li>
          <li>Introduce el textil previamente lavado y mordentado. Asegúrate de que quede completamente cubierto de agua y pueda moverse libremente; agrega más agua si es necesario.</li>
          <li>Calienta el baño a fuego durante treinta minutos a una hora, moviendo constantemente para que el color quede parejo. (Ajusta la temperatura según la fibra.)</li>
          <li>Apaga el fuego y deja que la fibra se enfríe dentro del tinte lo suficiente para poder manipularla, pero no la dejes demasiado tiempo: las partículas del tinte pueden depositarse disparejo y dejar manchas.</li>
          <li>Exprime y enjuaga solo con agua. Jamás uses jabón en este paso. Puedes usar la lavadora</li>
          <li>Tiende a la sombra</li>
        </Steps>
        <SideNote>
          Puedes macerar todo el material en agua fría desde la noche anterior, o incluso un par de
          días antes, para optimizar la extracción del color. El procedimiento tarda más, pero los
          tonos suelen ser más profundos.
        </SideNote>
        <SideNote>
          Si lo prefieres, puedes hacer la extracción y el teñido al mismo tiempo, pero entonces
          necesitas meter el material vegetal en una red fina y remover durante todo el
          procedimiento para que no queden manchas. Las redes de lavandería para calcetines
          funcionan muy bien para este truco; busca una de agujeros muy pequeños.
        </SideNote>
      </Recipe>
    </article>
  )
}

export default function LandingSale({ user, contents, manualPath, csrfToken }) {
  return (
    <main className="min-h-screen overflow-hidden bg-cream font-body text-blue-ink">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a
          href="/"
          className="font-display text-sm font-bold uppercase tracking-[0.13em] text-blue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
        >
          Antesis
        </a>
        <nav aria-label="Cuenta">
          {user ? (
            <TopMenu user={user} />
          ) : (
            <a
              href="/users/sign_in"
              className="font-display font-semibold text-blue underline decoration-orange decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
            >
              Iniciar sesión
            </a>
          )}
        </nav>
      </header>

      <section
        aria-labelledby="sales-title"
        className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-8 sm:px-8 md:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] md:py-20 lg:gap-16 lg:px-10"
      >
        <div aria-hidden="true" className="absolute -left-40 top-10 h-72 w-72 rounded-full bg-orange/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-orange-ink">
            Compilación de fórmulas para extraer, teñir y pintar
          </p>
          <h1 id="sales-title" className="mt-4 font-display text-5xl font-bold leading-[0.98] text-blue sm:text-6xl lg:text-7xl">
            El color de la tierra, en tus manos
          </h1>
          <div className="mt-7 max-w-xl space-y-4 text-[16px] leading-7 text-blue-ink/85 sm:text-lg sm:leading-8">
            <p>
              Más de una década de práctica reunida en fórmulas para teñir fibras, extraer
              pigmentos y preparar acuarelas, crayones y pinturas con plantas, minerales e
              insectos.
            </p>
            <p>
              Es una invitación a recuperar el asombro de una olla de índigo que cambia al tocar
              el aire y a encontrar calma, observación e intuición mientras el color aparece.
            </p>
            <p>
              Los colores naturales se mueven con la luz, se oxidan y se transforman. No prometen
              control: ofrecen memoria, voluntad y una manera más cercana de crear con la naturaleza.
            </p>
          </div>
          <div className="mt-8">
            {user ? <ReaderButton manualPath={manualPath} /> : <BuyButton csrfToken={csrfToken} />}
          </div>
          <p className="mt-4 text-sm text-blue-ink/65">PDF personalizado y acceso inmediato a la edición web.</p>
        </div>

        <figure className="relative mx-auto w-full max-w-sm md:max-w-md">
          <div aria-hidden="true" className="absolute -inset-4 rotate-3 bg-orange/15" />
          <img
            src={coverUrl}
            alt="Portada del Manual del Color Vivo, de Anabel Torres Chávez"
            className="relative w-full shadow-[0_28px_80px_rgba(25,45,75,0.24)]"
          />
          <figcaption className="relative mt-5 text-center font-display text-sm font-semibold text-blue-ink/70">
            132 páginas · fórmulas, procesos y atlas cromático
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="contents-title" className="border-y border-blue/10 bg-white/30">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-orange-ink">Del origen a la práctica</p>
            <h2 id="contents-title" className="mt-3 font-display text-3xl font-bold text-blue sm:text-4xl">Todo un lenguaje de color</h2>
            <p className="mt-4 leading-7 text-blue-ink/80">
              Fundamentos, seguridad, teñido, pigmentos, pinturas y objetos cotidianos organizados
              para consultar mientras trabajas.
            </p>
          </div>
          <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contents.map((chapter, index) => (
              <ContentsCard key={chapter.slug} chapter={chapter} index={index} />
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="recipe-title" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <RecipePreview />
      </section>

      <section aria-labelledby="final-cta-title" className="bg-blue px-5 py-16 text-center text-white sm:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-orange">Manual del Color Vivo</p>
          <h2 id="final-cta-title" className="mt-3 font-display text-3xl font-bold sm:text-4xl">Empieza a mirar el color de otra manera</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/80">
            Una guía para experimentar, observar y crear con los colores que ya viven a tu alrededor.
          </p>
          <div className="mt-8">
            {user ? (
              <ReaderButton manualPath={manualPath} />
            ) : (
              <BuyButton csrfToken={csrfToken} className="flex justify-center" />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
