import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Los gises son barras de carga mineral pigmentada, usadas para escribir en pizarras o dibujar al aire libre sobre superficies rugosas. La técnica de moler tierras blancas (creta, caliza, yeso) y mezclarlas con un aglutinante para formar barras se remonta a la antigüedad. A diferencia de los pasteles, los gises tienen más carga y menos pigmento, lo que los hace más firmes, con un trazo polvoso ideal para superficies absorbentes.</p>
      <Recipe rendimiento={"3 a 4 barras medianas."} tiempo={"20 minutos aproximadamente, de secado."}>
        <Steps>
          <li>Disuelve 5 gramos de goma arábiga en 30 ml de agua tibia.</li>
          <li>En un recipiente, mezcla 20 gramos de carmás 24 a 48 horas bonato de calcio con 10 gramos de pigmento bien molido.</li>
          <li>Agrega gota a gota la solución del aglutinante a la mezcla seca, integrando con una espátula hasta formar una pasta tipo plastilina.</li>
          <li>Agrega 3 gramos de jabón en barra rallado.</li>
          <li>Forma cilindros con las manos o vierte la pasta en moldes de silicona.</li>
          <li>Deja secar de 24 a 48 horas en un lugar ventilado.</li>
          <li>Desmolda cuando estén completamente secos.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
