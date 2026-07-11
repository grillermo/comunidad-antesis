import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El pastel suave es la versión clásica: pigmento mezclado con un poco de aglutinante y carga, formado en barras blandas que se desprenden con facilidad sobre el papel. Es ideal para difuminar con los dedos y crear texturas aterciopeladas.</p>
      <Recipe rendimiento={"6 a 8 barras pequeñas."} tiempo={"15 minutos aproximadamente, más 24 a 48 horas de secado."}>
        <Steps>
          <li>Disuelve 10 gramos de goma arábiga en 30 ml de agua destilada o filtrada.</li>
          <li>Mezcla 20 gramos de pigmento bien molido con 10 gramos de arcilla caolín bien molido.</li>
          <li>Agrega dos gotas de miel de abeja.</li>
          <li>Agrega la goma arábiga diluida en agua gota a gota hasta formar una pasta espesa tipo plastilina, ayudándote con una espátula de arte.</li>
          <li>Forma cilindros con las manos o vierte la pasta en moldes de silicona.</li>
          <li>Deja secar de 24 a 48 horas en un lugar ventilado.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
