import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Si te interesa utilizar los pigmentos para pintar sobre tela, especialmente para serigrafía, te recomiendo mezclarlos con una base de pintura acrílica comercial, una base de pintura textil o una tinta de serigrafía a base de agua incolora o blanca; así obtendrás resultados más resistentes al paso del tiempo y a las lavadas.</p>
      <p>Si prefieres un enfoque más artesanal e histórico, te comparto esta receta de pintura textil con leche de soya. Está basada en la técnica japonesa gōjiru (呉汁), que significa “jugo de soya”, y que se ha utilizado durante siglos en técnicas como el katazome (teñido con stencils), el bingata (su variante policroma de Okinawa) y el tsutsugaki (dibujo con pasta de resistencia). La proteína de la soya se adhiere a la fibra y, al curar, fija el pigmento de forma duradera. Es importante usar leche de soya casera y fresca, ya que la leche comercial contiene aditivos y ha sido pasteurizada, lo cual afecta la proteína y la vuelve mucho menos efectiva como aglutinante.</p>
      <Recipe rendimiento={""} tiempo={"30 minutos Después se necesita una a dos semanas de curado antes del primer enjuague."}>
        <Steps>
          <li>Prepara leche de soya fresca puedes enconde trabajo activo. trar la receta en el capítulo de Modificadores y tratamientos de color.</li>
          <li>Aplica leche de soya con una brocha sobre el textil previamente lavado.</li>
          <li>Deja secar el textil extendido a la sombra.</li>
          <li>Mezcla una parte de pigmento por tres partes de leche de soya e incorpora muy bien.</li>
          <li>Si deseas una pintura más consistente, puedes agregar un gramo de goma guar o goma arábiga.</li>
          <li>Aplica la pintura sobre la tela y deja curar de una a dos semanas en un lugar fresco, seco y oscuro.</li>
          <li>Enjuaga solo con agua.</li>
          <li>No talles excesivamente el estampado cuando laves la prenda.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
