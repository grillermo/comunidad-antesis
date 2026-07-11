import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'
import { MaterialList, Material } from '@/components/manual/MaterialList'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>A diferencia de la fórmula con fructosa, esta variante usa sulfato ferroso como agente reductor. El proceso es más lento (necesita tres días de reposo en lugar de uno) y solo funciona sobre fibras de celulosa, pero a cambio te ofrece un baño más estable, que requiere menos mantenimiento y que dura varios meses sin perder fuerza. Es la fórmula que prefiero cuando voy a teñir grandes cantidades de algodón o lino a lo largo de varias semanas.</p>
      <Callout>
        <p>Usa mascarilla y lentes de protección al moler el índigo y al incorporar la cal y el sulfato ferroso al tinte. El sulfato ferroso es irritante y debe manipularse con cuidado; evita inhalarlo, no lo ingieras, usa guantes y manténlo lejos del alcance de niños y animales de compañía.</p>
      </Callout>
      <MaterialList>
        <Material term="40 gramos de índigo" />
        <Material term="80 gramos de sulfato ferroso" />
        <Material term="120 gramos de cal hidratada" />
        <Material term="7 litros de agua" />
        <Material term="Vinagre blanco" />
        <Material term="Báscula" />
        <Material term="Fuente de calor" />
        <Material term="Mortero y pistilo" />
        <Material term="Pala de madera" />
        <Material term="Olla con tapa de al menos 7 litros de capacidad" />
        <Material term="Tina o recipiente para enjuagar fibras" />
      </MaterialList>
      <Recipe tiempo="3 días aproximadamente, 1 hora de trabajo activo, más el tiempo de teñido, que varía con la intensidad del tono.">
        <Steps title="Procedimiento para preparar el tinte">
          <li>Muele el índigo hasta obtener un polvo lo más fino posible.</li>
          <li>Agrega agua caliente y muele hasta obtener una pasta suave libre de grumos.</li>
          <li>Llena la olla con 2 litros de agua hirviendo.</li>
          <li>Agrega la pasta de índigo y mezcla bien.</li>
          <li>Agrega el sulfato ferroso.</li>
          <li>Agrega la cal hidratada.</li>
          <li>Agrega de 1 a 4 litros de agua hirviendo dependiendo del nivel deseado: entre más agua se agregue, más claro será el color de la primera inmersión. Yo te recomiendo agregar 3 litros de agua para obtener un baño de 5 litros.</li>
          <li>Mezcla con cuidado cada 60 minutos durante las siguientes tres horas.</li>
          <li>Tapa y deja reposar 3 días en un lugar fresco y seco.</li>
        </Steps>
      </Recipe>
      <Steps title="Procedimiento para teñir">
        <li>Al tercer día, puedes usar el tinte para teñir. Te recomiendo usar guantes cuando trabajes con él.</li>
        <li>Todas las fibras deben estar lavadas previamente y mojarse en agua tibia antes de sumergirse.</li>
        <li>Cuando el tinte se haya vuelto de color verde amarillento, hay espuma azul y un poco de espuma cobriza en la parte superior (conocida como flor de índigo), el tinte está listo para teñir.</li>
        <li>Sumerge tu madeja, fibra o tela mojada en el tinte y mantenla sumergida durante un periodo de 3 a 15 minutos.</li>
        <li>Retira con cuidado la fibra, dejando que el exceso de líquido drene en una cubeta o recipiente que se verterá más tarde en la olla. Comenzarás a ver cómo la fibra cambia de verde oscuro a verde azulado y luego a azul.</li>
        <li>Permite que la fibra se vuelva azul después de cada inmersión —sin áreas verdes azuladas o amarillentas— y deja que la fibra se airee durante al menos 5 minutos abriendo las madejas o extendiendo la tela.</li>
        <li>Continúa sumergiendo la fibra las veces que quieras hasta que esté dos tonos más oscura de lo que deseas.</li>
        <li>Cuando termines de teñir, vierte de regreso a la olla principal todo el exceso de tinte que haya quedado en las fibras y en los recipientes de drenado.</li>
        <li>Enjuaga la fibra solo con agua.</li>
        <li>Después de enjuagar, remoja la fibra en agua con una taza de vinagre blanco por cada 3 litros de agua durante 20 minutos. Después exprime y coloca la fibra en una olla con agua limpia y ponla a hervir durante media hora.</li>
        <li>Exprime y tiende a la sombra.</li>
      </Steps>
      <SideNote>Este tinte no necesitará estabilizarse, pero si quieres puedes calentar la olla suavemente a 50 °C cada vez que la utilices para obtener tonos más parejos e intensos.</SideNote>
      <SideNote>La olla se puede rellenar con una solución de base adicional cuando el azul ya no sea tan intenso. Prepara una mezcla nueva de 2 litros en otra olla o recipiente y agrégala al tinte existente. Espera 3 días antes de usarlo.</SideNote>
      <SideNote>Puedes guardar el tinte transfiriéndolo a una cubeta con tapa para que no se evapore. Etiquétalo y considera que, si no lo utilizas ni le agregas más solución de base adicional, caducará en 10 meses.</SideNote>
      <SideNote>Cuando el tinte ya no tiña de azul, modifica su pH agregando de 1 a 2 tazas de vinagre blanco. Vierte el líquido por el desagüe cuando esté frío y tira a la basura el sedimento ya que puede tapar la tubería. Opcionalmente, también puedes poner el tinte al sol, esperar a que se evapore y tirar los restos sólidos a la basura.</SideNote>
    </ManualLayout>
  )
}
