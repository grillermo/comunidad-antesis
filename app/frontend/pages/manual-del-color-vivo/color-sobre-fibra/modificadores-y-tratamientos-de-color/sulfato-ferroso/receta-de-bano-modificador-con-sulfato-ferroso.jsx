import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Este baño se hace después de teñir. Si metes un textil amarillo, ocre o rojizo al agua con hierro, en cuestión de minutos lo verás apagarse y oscurecerse. El hierro lo transforma. Reacciona especialmente bien con tintes ricos en taninos formando grises, verdes y negros. Trabaja rápido y observa con atención, porque el cambio puede darse en segundos.</p>
      <Recipe rendimiento={""} tiempo={"45 minutos aproximadamente, 10 minutos activos."}>
        <Steps>
          <li>Prepara una cubeta con suficiente agua tibia y 1% del peso del textil en sulfato ferroso. La proporción ideal es 1:20 (textil:agua), pero basta con que la fibra se pueda mover libremente.</li>
          <li>Introduce la fibra ya teñida y mueve la mezcla constantemente durante un máximo de 15 minutos, o hasta que te guste el color.</li>
          <li>Retira y enjuaga. Asegúrate de usar guantes. Para este paso no uso la lavadora porque puede afectar el metal de la máquina.</li>
          <li>Después de este baño es necesario neutralizar los residuos de hierro: sumerge la fibra en agua con una taza de vinagre blanco por 20 minutos. Esto ayuda a estabilizar el color y a quitar el exceso de metal en la fibra.</li>
          <li>Enjuaga una vez más, puedes usar la lavadora, y tiende a la sombra.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
