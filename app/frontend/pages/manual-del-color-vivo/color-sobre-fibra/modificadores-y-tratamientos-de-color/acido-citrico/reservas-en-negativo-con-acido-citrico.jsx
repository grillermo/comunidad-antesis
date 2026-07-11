import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Esta técnica invierte la lógica del teñido. El ácido cítrico elimina el mordiente de aluminio en las zonas donde lo aplicas, desactivando la capacidad del textil de recibir color en esos puntos. Cuando sumerges la tela en el tinte, el dibujo aparece como un fantasma claro sobre el fondo teñido. Funciona en cualquier material y es perfecta para estampar con sellos caseros: papas talladas, corchos o goma.</p>
      <Recipe rendimiento={""} tiempo={"varía según el mordentado, el secado y el teñido posterior. Considera 2-3 días de trabajo repartido."}>
        <Steps>
          <li>Lava y mordenta la tela con aluminio. Ver Guía de lavado y Guía de mordentado.</li>
          <li>Deja secar.</li>
          <li>Prepara una mezcla con 100 ml de agua y 20 g de ácido cítrico y disuelve muy bien. También puedes usar jugo de limón directamente.</li>
          <li>Si necesitas que la solución sea más espesa, puedes agregar un 1g de goma arábiga en polvo.</li>
          <li>Aplica en la tela con un pincel, sello o pantalla.</li>
          <li>Deja secar.</li>
          <li>Introduce en el tinte de tu elección.</li>
          <li>El color se fijará en la tela, excepto en donde aplicaste la solución de ácido cítrico, revelando el motivo.</li>
          <li>Enjuaga bien con solo agua. Puedes usar la lavadora.</li>
          <li>Exprime y tiende a la sombra.</li>
        </Steps>
        <SideNote>Si el motivo sale débil o difuso, prueba con una mayor concentración de ácido cítrico o aplica la solución dos veces, dejándolo secar entre capas.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
