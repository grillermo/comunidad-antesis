import ManualLayout from '@/components/ManualLayout'
import Subheading from '@/components/manual/Subheading'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Antes de empezar, toma en cuenta estas medidas. Son simples, pero marcan la diferencia entre un proceso tranquilo y un riesgo prevenible.</p>
      <Subheading>Antes de empezar</Subheading>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange">
        <li>Asegúrate de haber identificado correctamente todas las plantas, colorantes, pigmentos, mordientes y reactivos antes de utilizarlos, investiga sus propiedades, manejo, toxicidad y sigue las recomendaciones de uso.</li>
        <li>Guarda las herramientas y materiales en un lugar fresco, seco y fuera del alcance de niños y animales de compañía.</li>
        <li>Trabaja en un lugar ventilado.</li>
        <li>No utilices herramientas de teñido o extracción de pigmentos para cocinar o comer. Con el calor, podrían absorber sustancias que no quieres en tu comida. Aunque usemos los colorantes, pigmentos, mordientes y reactivos más seguros, algunos son irritantes, altos en taninos o simplemente no aptos para el consumo.</li>
        <li>Lo mismo aplica para las esponjas y cepillos para limpiar herramientas: ten un juego dedicado solo al teñido, separado del de la cocina.</li>
      </ul>
      <Subheading>Durante el trabajo</Subheading>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange">
        <li>Usa guantes de nitrilo o látex al manipular tintes y mordientes, y agarraderas o guantes de silicona para mover ollas calientes.</li>
        <li>Utiliza mascarilla y lentes de protección cuando trabajes con polvos finos como la cal, el alumbre en polvo o el índigo en polvo.</li>
        <li>Mantén las ollas tapadas, a fuego bajo, y evita inhalar el vapor.</li>
        <li>Vigila el nivel del agua y agrega más si se evapora. Una olla que se queda seca puede quemar el material y dañar el recipiente.</li>
        <li>Para evitar quemaduras, permite que las fibras o los pigmentos se enfríen antes de enjuagarlos.</li>
      </ul>
      <Subheading>Al terminar</Subheading>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange">
        <li>Limpia bien todas las superficies después de trabajar.</li>
        <li>Desecha los tintes con responsabilidad. Los que contienen mordientes metálicos, como el sulfato ferroso, deben diluirse con más agua antes de vaciarlos y no se pueden verter directamente en plantas o cuerpos de agua.</li>
      </ul>
    </ManualLayout>
  )
}
