import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Para limpiar a profundidad tela nueva de algodón, lino o cáñamo e hilos y estambres crudos de cualquier material excepto lyocell y lana.</p>
      <p>Algunos ejemplos de tela cruda son la manta, la glasilla y la loneta. En las tiendas de telas suelen especificar si están crudas. En caso contrario busca estas señales: color beige amarillento, tacto áspero y ligero olor almidonado.</p>
      <Recipe rendimiento={""} tiempo={"3 a 4 horas aproximadamente, 20 minutos activos. La mayor parte del tiempo es hervor y enfriado sin supervisión."}>
        <Steps>
          <li>Introduce el textil en una olla con agua. Por cada kilo de ropa seca, agrega 10 gramos de jabón neutro previamente diluido en agua y dos cucharadas de carbonato de sodio.</li>
          <li>Asegúrate de que la fibra esté completamente cubierta de agua y se mueva libremente.</li>
          <li>Ponla a calentar. Cuando rompa el hervor, baja la flama y mantén a fuego bajo durante una hora, moviendo ocasionalmente.</li>
          <li>Apaga y deja que se enfríe por completo antes de vaciar. El agua saldrá turbia y amarillenta: es normal, son las impurezas disolviéndose.</li>
          <li>Una vez descrudado, termina con un Lavado simple (ver receta anterior) antes de mordentar o teñir.</li>
          <li>Seca o procede directo al teñido.</li>
        </Steps>
        <SideNote>Si la tela es cruda, la primera vez que toque el agua va a encoger aproximadamente un 10% tanto en largo como en ancho. Esto solo ocurre una vez. Algunas mantas y lonetas vienen tan cargadas de apresto que una sola ronda de descrudado no basta. Si después del primer descrudado la tela sigue sintiéndose rígida o el agua del enjuague sale turbia, repite el proceso. El agua del descrudado se puede tirar por el drenaje sin problema. El agua del enjuague final puede ser usada para regar plantas que no sean particularmente sensibles al pH alcalino (evita azaleas, gardenias, hortensias).</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
