import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Prefiero hacer la leche de soya en casa porque me gusta saber qué lleva y tener la cantidad justa para lo que voy a teñir. Para esta receta puedes usar la licuadora y los utensilios de tu cocina. Si tienes prisa o no consigues frijoles de soya, la leche comercial sin azúcar funciona igual.</p>
      <Recipe rendimiento={""} tiempo={"24 horas 15 minutos aproximadamente, 15 minutos activos; el resto es remojo."}>
        <Steps>
          <li>Coloca 30 gramos de frijoles de soya en un vaso con suficiente agua para que queden completamente cubiertos y déjalos remojar por 24 horas.</li>
          <li>Al día siguiente, drena el agua y coloca solo los frijoles en la licuadora con 250 ml de agua y muele por 3 minutos o hasta que todo esté completamente integrado.</li>
          <li>Usa un colador fino o una gasa de tela para filtrar todos los sólidos. Conserva solo el líquido.</li>
          <li>Ponlo en una botella con tapa y guárdalo en el refrigerador.</li>
        </Steps>
        <SideNote>Debe ser utilizada en los próximos 3 días.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
