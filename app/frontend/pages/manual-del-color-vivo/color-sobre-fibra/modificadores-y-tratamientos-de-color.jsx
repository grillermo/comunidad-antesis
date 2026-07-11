import ManualLayout from '@/components/ManualLayout'
import Table, { Th, Td } from '@/components/manual/Table'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>En esta sección te presento algunas recetas y trucos que utilizo para mejorar el color, modificarlo y hacerlo más duradero. No son pasos absolutamente necesarios si estás empezando, pero si te interesa teñir proyectos comerciales o experimentar más profundamente, te recomiendo probarlos documentando todos los resultados y hacer muchas pruebas de lavado y resistencia a la luz.</p>
      <p>Hablaré de cinco modificadores: ácido tánico, sulfato ferroso, ácido cítrico, carbonato de calcio y leche de soya. Cada uno cambia el color de un modo distinto: preparan, oscurecen, matizan o intensifican y algunos sirven también para dibujar sobre tela.</p>
      <p>Quizás también hayas leído sobre el uso de clavos oxidados, bicarbonato de sodio o sulfato de cobre como modificadores caseros del color. Funcionan en cierta medida: el hierro oxidado libera iones que oscurecen los tintes, el bicarbonato altera el pH y el sulfato de cobre crea verdes y azules. Sin embargo, los resultados son impredecibles, poco reproducibles y, en algunos casos, riesgosos. La concentración real de hierro en un agua de clavos oxidados depende del tipo de metal (que incluso podría ser una aleación con plomo), de su pureza y del tiempo de remojo; el bicarbonato daña las fibras proteicas y degrada parte del colorante. El sulfato de cobre es el caso más delicado: es un metal pesado, sus vapores irritan las vías respiratorias y pueden causar dolores de cabeza, náuseas y mareos, y sus residuos no pueden tirarse al drenaje sin contaminar el agua. Son atajos populares en internet, pero si quieres resultados consistentes, duraderos y seguros, los modificadores que verás en este capítulo son una mejor inversión de tiempo y materiales.</p>
      <p>Te comparto una tabla que resume toda la información y te ayudará a conocerlos mejor y a seleccionarlos correctamente antes de preparar las recetas.</p>
      <Table>
        <thead>
          <tr>
            <Th>Modificador</Th>
            <Th>Qué hace</Th>
            <Th>Fibra</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>Ácido tánico</Td>
            <Td>Prepara la fibra antes de mordentar</Td>
            <Td>Celulosa</Td>
          </tr>
          <tr>
            <Td>Sulfato ferroso</Td>
            <Td>Oscurece y cambia hacia verdes, grises, negros</Td>
            <Td>Todas</Td>
          </tr>
          <tr>
            <Td>Ácido cítrico</Td>
            <Td>Cambia el color y retira mordiente</Td>
            <Td>Cambia algunos colores en proteína, y elimina el mordiente en cualquier fibra.</Td>
          </tr>
          <tr>
            <Td>Carbonato de calcio</Td>
            <Td>Intensifica, estabiliza, ilumina</Td>
            <Td>Todas</Td>
          </tr>
          <tr>
            <Td>Leche de soya</Td>
            <Td>Prepara la fibra de celulosa para que parezca de proteína</Td>
            <Td>Celulosa</Td>
          </tr>
        </tbody>
      </Table>
    </ManualLayout>
  )
}
