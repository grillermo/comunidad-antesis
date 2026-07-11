import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>En esta sección te presento algunas recetas y trucos que utilizo para mejorar el color, modificarlo y hacerlo más duradero. No son pasos absolutamente necesarios si estás empezando, pero si te interesa teñir proyectos comerciales o experimentar más profundamente, te recomiendo probarlos documentando todos los resultados y hacer muchas pruebas de lavado y resistencia a la luz.</p>
      <p>Hablaré de cinco modificadores: ácido tánico, sulfato ferroso, ácido cítrico, carbonato de calcio y leche de soya. Cada uno cambia el color de un modo distinto: preparan, oscurecen, matizan o intensifican y algunos sirven también para dibujar sobre tela.</p>
      <p>Quizás también hayas leído sobre el uso de clavos oxidados, bicarbonato de sodio o sulfato de cobre como modificadores caseros del color. Funcionan en cierta medida: el hierro oxidado libera iones que oscurecen los tintes, el bicarbonato altera el pH y el sulfato de cobre crea verdes y azules. Sin embargo, los resultados son impredecibles, poco reproducibles y, en algunos casos, riesgosos. La concentración real de hierro en un agua de clavos oxidados depende del tipo de metal (que incluso podría ser una aleación con plomo), de su pureza y del tiempo de remojo; el bicarbonato daña las fibras proteicas y degrada parte del colorante. El sulfato de cobre es el caso más delicado: es un metal pesado, sus vapores irritan las vías respiratorias y pueden causar dolores de cabeza, náuseas y mareos, y sus residuos no pueden tirarse al drenaje sin contaminar el agua. Son atajos populares en internet, pero si quieres resultados consistentes, duraderos</p>
      <p>y seguros, los modificadores que verás en este capítulo son una mejor inversión de tiempo y materiales.</p>
      <p>Te comparto una tabla que resume toda la información y te ayudará a conocerlos mejor y a seleccionarlos correctamente antes de preparar las recetas.</p>
      <p>Modificador Qué hace Fibra</p>
      <p>Ácido tánico Prepara la fibra antes Celulosa de mordentar</p>
      <p>Oscurece y cambia Sulfato ferroso hacia verdes, grises, Todas negros</p>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">Cambia algunos
                              Cambia el color y          colores en pro-
        Ácido cítrico         retira mordiente           teína, y elimina
                                                         el mordiente en
                                                         cualquier fibra.</pre>
      <p>Carbonato de Intensifica, estabiliza, Todas calcio ilumina</p>
      <p>Prepara la fibra de Leche de soya celulosa para que Celulosa parezca de proteína</p>
    </ManualLayout>
  )
}
