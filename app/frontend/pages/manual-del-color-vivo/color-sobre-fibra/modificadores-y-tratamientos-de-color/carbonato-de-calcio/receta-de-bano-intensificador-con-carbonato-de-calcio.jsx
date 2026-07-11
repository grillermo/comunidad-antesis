import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El carbonato de calcio también se puede utilizar para preparar un baño para el textil, ya sea antes o después de teñirlo, y obtener colores más estables, resistentes a la luz e intensos. Te recomiendo hacer este baño al terminar de teñir, sobre todo cuando hayas mordentado fibras celulósicas con acetato de aluminio, ya que ayuda a fijar mejor el color.</p>
      <Recipe rendimiento={""} tiempo={"25 minutos 20 minutos activos."}>
        <Steps>
          <li>Para preparar un baño de carbonato de calaproximadamente, cio, llena una cubeta con agua y 5 gramos de carbonato de calcio por cada litro de agua. Disuelve bien.</li>
          <li>Introduce el textil durante 15 minutos, moviéndolo constantemente.</li>
          <li>Saca el textil y enjuaga con agua.</li>
        </Steps>
        <SideNote>Yo prefiero hacer este baño después de teñir para ver cómo cambia el color. Puedes reutilizar el agua de carbonato de calcio varias veces, pero agrega más agua y carbonato de calcio según haga falta.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
