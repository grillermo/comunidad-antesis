import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El pastel al óleo es más reciente: la cera y el aceite reemplazan al aglutinante acuoso. Resulta en barras más cremosas, intensas y resistentes que los pasteles suaves, parecidas a los crayones, pero de mayor calidad.</p>
      <Recipe rendimiento={"4 a 6 barras pequeñas."} tiempo={"15 minutos de preparación más 1 a 2 horas de enfriado."}>
        <Steps>
          <li>Derrite 15 gramos de cera de abeja a baño maría. Si quieres una opción vegana, puedes usar cera de soya o cera carnauba.</li>
          <li>Retira del calor y añade 15 gramos de aceite de linaza o de nuez.</li>
          <li>Incorpora 20 gramos de pigmento poco a poco, mezclando constantemente hasta que quede homogéneo.</li>
          <li>Vierte en moldes de silicona.</li>
          <li>Deja enfriar de 1 a 2 horas hasta solidificar completamente.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
