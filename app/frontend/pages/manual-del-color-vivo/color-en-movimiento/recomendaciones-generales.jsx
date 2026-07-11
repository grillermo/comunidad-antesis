import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Los aglutinantes transforman el pigmento en sustancias maleables, le dan cohesión y permiten que el color se adhiera al papel o a la superficie que quieres pintar. Según el aglutinante o medio que utilices, la pintura puede volverse más fluida, transparente, densa, mate o satinada. Al preparar una pintura, busco primero una pasta homogénea, sin grumos, donde cada partícula quede bien envuelta por el medio. Trabajo la mezcla lentamente, hago un pequeño monte de pigmento e incorporo el aglutinante en pequeñas cantidades en el centro del pigmento y mezclo con una espátula hasta lograr una textura cremosa y flexible. Si la pintura queda demasiado seca, tenderá a cuartearse al secar; si tiene exceso de medio, perderá intensidad o tardará más en fijarse.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Preparo todas estas recetas en una base de vidrio con ayuda de una moleta de vidrio y espátulas de arte; prefiero utilizar materiales de grado alimenticio o cosmético, y agua destilada para mantener su pureza. Si no consigues agua destilada, puedes utilizar agua de lluvia o filtrada. Cuando muelas o viertas pigmentos en polvo, usa mascarilla y lentes de protección.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Considera que también puedes usar aglutinantes o medios comerciales en lugar de prepararlos por tu cuenta, o hacer fórmulas que mezclen ambos. Más que fórmulas rígidas, estas</li></ul>
      <p>preparaciones son puntos de partida. Te recomiendo probar pequeñas cantidades, observar cómo secan y anotar proporciones. Con el tiempo, desarrollarás tu propia sensibilidad para reconocer cuando la pintura esté lista: ni demasiado líquida ni demasiado rígida, sino el punto exacto donde la textura correcta sostenga un color.</p>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Todas las recetas en esta sección son fórmulas tradicionales a base de productos simples y fáciles de conseguir, lo cual las hace más sensibles a la luz del sol que las pinturas acrílicas, vinílicas o con pigmentos sintéticos. Te recomiendo hacer pruebas antes de pensar en proyectos comerciales. Evita que la luz del sol les dé directamente e incorpora recursos modernos para proteger tus obras: por ejemplo, cristales con filtro UV si vas a enmarcarlas, o un barniz o aerosol fijador con filtro UV al terminar.</li></ul>
    </ManualLayout>
  )
}
