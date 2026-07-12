import { Link } from '@inertiajs/react'
import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>A lo largo de la historia, diversas culturas han aprovechado plantas, raíces, cortezas y frutos para obtener colores; estas tintas son básicamente los mismos tintes que usamos para teñir, pero más concentrados y con un aglutinante que facilita su aplicación sobre papel. Producen tonos naturales y orgánicos, aunque no son muy resistentes a la luz; son ideales para ilustración experimental, papel decorativo, papel artesanal, proyectos escolares o como material de arte para niños.</p>
      <p>Este es uno de mis materiales de arte favoritos. Puedes preparar una tinta de varias formas: reduciendo un tinte sobrante de teñido con más calor, dejando que se evapore para que el color se concentre, o haciendo una extracción nueva desde cero. Además, puedes aplicar todo lo que aprendiste en la sección de teñido sobre <Link href="/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color" className="underline text-orange-ink hover:text-orange">modificadores de color</Link> y pH para crear distintos efectos e interacciones con tus tintas.</p>
      <p>Aquí te dejo un ejemplo básico con palo de Brasil para que comiences a experimentar. Puedes sustituirlo con otro material vegetal seco que hayas identificado y que tenga propiedades tintóreas: hojas, raíces, cáscaras o flores.</p>
      <Recipe rendimiento={"200 ml de tinta"} tiempo={"24 horas de remojo más 3 a 4 horas de cocción y enfriado. La tinta tiene una duración indefinida cuando está bien almacenada."}>
        <Steps>
          <li>En una olla grande, coloca 600 ml de agua y 100 gramos de palo de Brasil; déjalo remojanconcentrada. do por 24 horas.</li>
          <li>Calienta a fuego bajo por 3 a 4 horas o hasta que se haya reducido a aproximadamente un tercio o 200 ml.</li>
          <li>Retira del fuego y deja enfriar.</li>
          <li>Filtra el material vegetal con la ayuda de filtros de papel y un colador o embudo.</li>
          <li>Prueba la textura. Si buscas más consistencia, puedes agregar de 1 a 10 gramos de goma arábiga, goma guar o goma xantana.</li>
          <li>Agrega tres gotas de aceite esencial de clavo como fungicida.</li>
          <li>Vierte la tinta en un frasco de vidrio con tapa y consérvala en un lugar fresco, seco y donde no le dé la luz directamente.</li>
          <li>Ya que el palo de Brasil cambia de color con el pH, puedes hacer pruebas y experimentos: coloca tinta sobre papel y encima espolvorea un poco de ácido cítrico, alumbre, sulfato ferroso o gotas de limón para cambiar el color. También puedes encimar tintas de diferentes colores para crear efectos interesantes.</li>
          <li>Esta tinta tiene duración indefinida, pero si observas que le crece moho, debes desecharla.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
