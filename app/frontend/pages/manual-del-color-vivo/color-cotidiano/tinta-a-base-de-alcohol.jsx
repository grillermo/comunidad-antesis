import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Este tipo de tinta es más moderna y experimental. Puedes usar cualquier material vegetal, incluso si no se considera tintóreo: lo interesante de esta técnica es que los colores resultantes, aunque sutiles, conservan tonalidades más cercanas a las del material original. El alcohol extrae compuestos distintos a los que extrae el agua caliente, por eso muchas plantas dan colores diferentes según el solvente que se use. Considera que estas tintas no se mezclan bien con tintas de agua y son un poco más sensibles a la luz.</p>
      <p>Aquí te dejo una tinta a base de cúrcuma. Puedes sustituirla por otros materiales vegetales: pétalos de flores, raíces, cortezas, especias o cualquier planta seca que despierte tu curiosidad; solo asegúrate de identificar y revisar su toxicidad.</p>
      <Recipe rendimiento={""} tiempo={"14 días de maceración, preparación activa de 10 minutos. La tinta tiene una duración indefinida cuando está bien almacenada. esperar, déjalo rep Agítalo regularment envasa en un frasco Guárdalo en un luga utilices."}>
        <Steps>
          <li>Agrega 20 gramos de cúrcuma seca a un frasco de vidrio con tapa.</li>
          <li>Cubre todo el material vegetal con 100 ml de alcohol; puede ser etílico o de caña.</li>
          <li>Ciérralo y agítalo bien.</li>
          <li>Guarda el frasco en un lugar oscuro. Idealmente estará listo en dos semanas, si no puedes osando al menos 12 horas. e para ayudar a la extracción.</li>
          <li>Filtra con una gasa de algodón o muselina y de vidrio oscuro o ámbar. r oscuro mientras no lo</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
