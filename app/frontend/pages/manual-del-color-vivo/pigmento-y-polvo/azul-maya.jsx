import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El azul maya es un pigmento mesoamericano color turquesa de extraordinaria estabilidad. Fue desarrollado por culturas prehispánicas y ha sido utilizado desde al menos el periodo Clásico por los mayas. Lo encontramos en los murales de Bonampak y Cacaxtla, en cerámica ceremonial, en códices, estatuillas y en figuras de barro arrojadas al Cenote sagrado de Chichén Itzá. Es increíble que mil años después el color sigue ahí, intacto.</p>
      <p>Nadie conoce realmente la receta original ni los materiales exactos de su composición; sin embargo, hay varias aproximaciones. Se cree que se compone principalmente de índigo encapsulado dentro de los microcanales de una arcilla fibrosa, lo que le confiere una resistencia excepcional al paso del tiempo, la luz, la humedad y los agentes químicos. La arcilla protege a la molécula de índigo y, al mismo tiempo, intensifica su tono hacia un turquesa vibrante que el índigo solo no logra.</p>
      <p>Prepararlo es, en cierta forma, un pequeño homenaje a ese antiguo conocimiento, y verás cómo el polvo gris cambia frente a tus ojos.</p>
      <Recipe rendimiento={"21 a 22 gramos de pigmento."} tiempo={"30 minutos aproximadamente, 20 minutos de"}>
        <Steps>
          <li>Mezcla en una olla o vaso de precipitado 2 gramos de índigo en polvo con 20 gramos de arcilla paligorskita, sepiolita, atapulgita o tierra de batán.</li>
          <li>Calienta a fuego muy bajo y mezcla constantrabajo activo. temente para evitar que se queme.</li>
          <li>Después de unos 15 minutos, el polvo grisáceo pasará a turquesa y finalmente tendrá unos destellos color violeta.</li>
          <li>Apaga el fuego y deja enfriar.</li>
          <li>Almacena en un frasco con tapa en un lugar fresco y seco.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
