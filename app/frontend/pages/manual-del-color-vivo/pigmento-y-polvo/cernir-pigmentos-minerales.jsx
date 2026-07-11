import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Es posible recolectar tierra para hacer pigmento natural. Lo más recomendable es buscar tierras ricas en óxidos de hierro, que son de color ocre, amarillo o marrón; estas tierras son conocidas como rocas sedimentarias ferruginosas y han sido usadas como pigmentos desde la prehistoria. Puedes encontrarlas principalmente en deltas de ríos y lagos, taludes, barrancos o cortes de camino donde la tierra ha quedado expuesta. Estas tierras son muy estables, particularmente por su buena resistencia a la luz. Minerales como la hematita producen tonos rojos intensos cuando se muelen, mientras que la limonita da colores amarillos y ocres; también puedes recolectar arcillas de distintos colores: blancas, grises, rojizas o verdosas. Una forma de confirmar que la arcilla o tierra que encuentras sirve como pigmento es probando su plasticidad; esto significa que, si le agregas agua se vuelve maleable y moldeable, como si fuera masa o plastilina, sin desmoronarse ni agrietarse de inmediato.</p>
      <p>En todos los casos, es importante evitar zonas contaminadas, como bordes de carreteras muy transitadas o áreas industriales, y no recolectar minerales muy brillantes o reflejantes, ya que pueden contener metales pesados.</p>
      <p>Después de recolectarlas y antes de usarlas, debes levigarlas y cernirlas para controlar el tamaño de sus partículas y hacer así el polvo más fino y uniforme; esto es importante porque cambia completamente su adherencia y su comportamiento al mezclarse con un medio, otros pigmentos o pintura.</p>
      <Recipe rendimiento={""} tiempo={"24 horas aproximadamente, 30 minutos de trabajo activo."}>
        <Steps>
          <li>Si es una piedra, primero debes molerla con un martillo o mortero hasta obtener un polvo lo más fino posible.</li>
          <li>Extiende la tierra triturada en una bandeja.</li>
          <li>Déjala secar completamente al sol.</li>
          <li>Mezcla la tierra con suficiente agua filtrada en un recipiente y revuelve muy bien deshaciendo todas las piedras que puedas.</li>
          <li>Agita vigorosamente y deja reposar 5 segundos.</li>
          <li>Vierte esa agua turbia en otro recipiente, sin vaciar las piedras que se asentaron al fondo. Esta agua con color es el pigmento suspendido.</li>
          <li>Desecha todo lo que quedó en el fondo del primer recipiente.</li>
          <li>Con ayuda de un colador retira todas las partículas que floten en el agua pigmentada del segundo recipiente. — Podrías encontrar restos de plantas, basura o insectos.</li>
          <li>Deja reposar por 12 horas.</li>
          <li>Decanta el agua. — El pigmento se encuentra en el fondo.</li>
          <li>Pon el recipiente con el sedimento al sol hasta que esté completamente seco.</li>
          <li>Muele el pigmento lo más fino posible.</li>
          <li>Almacénalo en un frasco con tapa.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
