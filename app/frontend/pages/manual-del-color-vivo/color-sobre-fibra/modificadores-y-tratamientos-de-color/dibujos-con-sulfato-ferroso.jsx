import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Este es uno de los modificadores que puedes usar para dibujar en la tela. En lugar de aportar color, lo modifica: donde toca el pincel, el tinte previo se oscurece, se apaga, cambia. Funciona especialmente bien sobre textiles teñidos con plantas ricas en taninos. Cada tinte reacciona distinto, así que te recomiendo hacer pruebas.</p>
      <Recipe rendimiento={""} tiempo={"40 minutos aproximadamente, 20 minutos activos, más el tiempo de secado, que varía según el grosor del textil y el clima."}>
        <Steps>
          <li>Prepara una solución con 100 ml de agua y 1g de sulfato ferroso, disuélvelo muy bien.</li>
          <li>Si necesitas que la solución sea más espesa, puedes agregar 1 g de goma arábiga en polvo o goma guar.</li>
          <li>Aplica en la tela, observa cómo cambia de color.</li>
          <li>Cuando termines, espera a que seque completamente antes de enjuagar con agua fría. Para este paso no uso la lavadora porque puede afectar el metal de la máquina.</li>
          <li>Después de este baño, es necesario neutralizar la fibra colocándola en agua con una taza de vinagre blanco durante 20 minutos.</li>
          <li>Enjuaga una vez más y tiende a la sombra. Puedes usar la lavadora para enjuagar la fibra.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
