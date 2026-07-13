import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'
import { MaterialList, Material } from '@/components/manual/MaterialList'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Comencemos por la fórmula con fructosa. Es la más amable de las dos y la mejor para empezar si nunca has teñido con índigo. Esta receta tiñe aproximadamente 1 kilogramo de fibra en un tono azul oscuro y servirá después para teñir otros artículos un poco más livianos en tonos más claros.</p>
      <Callout>
        <p>Usa mascarilla y lentes de protección al moler el índigo y al incorporar la cal; ninguno de estos ingredientes es tóxico, pero son irritantes y hay que usarlos con cuidado.</p>
      </Callout>
      <MaterialList>
        <Material term="40 gramos de índigo natural en polvo" />
        <Material term="80 gramos de hidróxido de calcio (también conocido como cal apagada)" />
        <Material term="120 gramos de cristales o jarabe de fructosa (también puedes usar miel de abeja o jarabe de agave, pero necesitarás agregar 20% más)" />
        <Material term="7 litros de agua" />
        <Material term="Vinagre blanco" />
        <Material term="Báscula" />
        <Material term="Fuente de calor" />
        <Material term="Mortero y pistilo" />
        <Material term="Pala de madera" />
        <Material term="Olla con tapa de al menos 7 litros de capacidad" />
        <Material term="Tina o recipiente para enjuagar fibras" />
      </MaterialList>
      <Recipe tiempo="25 horas aproximadamente, 1 hora de trabajo activo, más el tiempo de teñido, que varía con la intensidad del tono.">
        <Steps title="Procedimiento para preparar el tinte">
          <li>Muele el índigo hasta obtener un polvo lo más fino posible.</li>
          <li>Agrega agua caliente y muele hasta obtener una pasta suave libre de grumos.</li>
          <li>Llena la olla con 2 litros de agua hirviendo.</li>
          <li>Agrega la pasta de índigo y mezcla bien.</li>
          <li>Agrega la fructosa.</li>
          <li>Agrega cuidadosamente la cal hidratada.</li>
          <li>Agrega de 1 a 4 litros de agua hirviendo dependiendo del nivel deseado: entre más agua se agregue, más claro será el color de la primera inmersión. Yo te recomiendo agregar 3 litros de agua para obtener un baño de 5 litros.</li>
          <li>Mezcla con cuidado cada 60 minutos durante las siguientes tres horas.</li>
          <li>Tapa y deja reposar un día en un lugar fresco y seco.</li>
        </Steps>
      </Recipe>
      <Steps title="Procedimiento para teñir">
        <li>Todas las fibras deben estar lavadas previamente y mojarse en agua tibia antes de sumergirse. Puedes usar fibras a base de celulosa o proteína.</li>
        <li>Cuando el tinte se haya vuelto de color verde amarillento, haya una espuma azul y un poco de espuma cobriza en la parte superior (conocida como flor de índigo), el tinte está listo para teñir.</li>
        <li>Sumerge tu madeja, fibra o tela mojada en el tinte y mantenla sumergida durante un periodo de entre 3 y 15 minutos.</li>
        <li>Retira con cuidado la fibra, dejando que el exceso de líquido drene en una cubeta o recipiente que se vertirá más tarde en la olla. Comenzarás a ver cómo la fibra cambia de verde oscuro a verde azulado y luego a azul. (Esta es mi parte favorita)</li>
        <li>Permite que la fibra se vuelva azul después de cada inmersión sin áreas verdes azuladas ni amarillentas y deja que la fibra se airee durante al menos 5 minutos abriendo las madejas o extendiendo la tela.</li>
        <li>Continúa sumergiendo la fibra las veces que quieras hasta que esté dos tonos más oscura de lo que deseas.</li>
        <li>Cuando termines de teñir, vierte de regreso a la olla principal todo el exceso de tinte que haya quedado en las fibras y en los recipientes de drenado.</li>
        <li>Enjuaga la fibra solo con agua.</li>
        <li>Remoja la fibra en agua con una taza de vinagre blanco por cada 3 litros de agua durante 20 minutos. Después exprime y coloca la fibra en una olla con agua limpia y ponla a fuego bajo durante media hora.</li>
        <li>Exprime y tiende a la sombra.</li>
      </Steps>
      <SideNote>El tinte necesitará reactivarse cuando el líquido se vuelva azul. Calienta la tinta suavemente sin hervirla y agrega una cucharada de fructosa. Espera 15-30 minutos para que el tinte vuelva a un color amarillo-verdoso. Si permanece azul, agrega una cucharada de hidróxido de calcio, revuelve y espera otros 15 minutos. Es posible que debas repetir este proceso hasta que el tinte se vuelva a poner amarillo o ámbar.</SideNote>
      <SideNote>La olla se puede rellenar con una solución de base adicional cuando el azul ya no sea tan intenso. Prepara una mezcla nueva de 2 litros en otra olla o recipiente y agrégala al tinte existente. Espera 24 horas antes de usarlo.</SideNote>
      <SideNote>Puedes guardar el tinte transfiriéndolo a una cubeta con tapa para que no se evapore. Etiquétalo y considera que, si no lo utilizas ni le agregas más solución de base adicional, caducará en 6 meses.</SideNote>
      <SideNote>Tendrás que volver a estabilizarlo la próxima vez que lo uses, calentándolo y agregando más fructosa e hidróxido de calcio.</SideNote>
      <SideNote>Cuando el tinte ya no tiña de azul, y no quieras preparar más, modifica su pH agregando entre 1 y 2 tazas de vinagre blanco. Tíralo por el desagüe cuando esté frío y tira a la basura el sedimento, ya que puede tapar la tubería. Opcionalmente, también puedes poner el tinte al sol, esperar a que se evapore y tirar los restos sólidos a la basura.</SideNote>
    </ManualLayout>
  )
}
