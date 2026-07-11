import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El ácido cítrico es uno de los modificadores que también puedes usar para dibujar en tela de seda o lana teñida con grana cochinilla o palo de Brasil. Puedes preparar una pequeña cantidad con la siguiente receta y aplicarla con un pincel. Cada tinte reacciona distinto, así que te recomiendo hacer pruebas.</p>
      <Recipe rendimiento={""} tiempo={"30 minutos aproximadamente, 10 minutos activos, más el tiempo de secado, que varía según el grosor del textil y el clima."}>
        <Steps>
          <li>Prepara una solución con 100 ml de agua y 20 g de ácido cítrico, disuelve muy bien. También puedes usar jugo de limón directamente, sin diluir.</li>
          <li>También puedes usar jugo de limón directamente.</li>
          <li>Si necesitas que la solución sea más espesa, puedes agregar 1 g de goma arábiga en polvo.</li>
          <li>Aplica en la tela, observa cómo cambia de color.</li>
          <li>Cuando termines, espera a que seque completamente antes de enjuagar con agua fría. Puedes usar la lavadora.</li>
          <li>Exprime y tiende a la sombra.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
