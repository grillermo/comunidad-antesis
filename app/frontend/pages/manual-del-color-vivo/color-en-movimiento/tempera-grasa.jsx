import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>La tempera grasa es una variante de la tempera al huevo que surgió en el siglo XV, cuando los pintores empezaron a experimentar añadiendo aceite secante a la emulsión tradicional. La adición de aceite le da una textura más cremosa, mayor luminosidad y permite trabajar con más detalle y suavidad de pinceladas, conservando el secado relativamente rápido del huevo. Esta técnica fue un puente entre la tempera medieval y la pintura al óleo que dominaría el arte europeo en los siglos siguientes. Funciona bien sobre lienzo, papel, cartón y madera.</p>
      <Recipe rendimiento={"30 ml de emulsión."} tiempo={"15 minutos aproximadamente. La emulsión sin pigmento se conserva una semana en refrigeración. No es posible guardar esta pintura una vez mezclada con pigmento."}>
        <Steps>
          <li>Separa la yema de un huevo y ponla en la palma de tu mano.</li>
          <li>Pasa la yema de una mano a otra con cuidado de no reventarla. Con la mano libre, retira los restos de clara hasta que la yema se sienta seca y completamente sin clara.</li>
          <li>Coloca la yema en un frasco pequeño con tapa.</li>
          <li>Agrega 15 ml de aceite de linaza.</li>
          <li>Agita hasta que los contenidos se combinen perfectamente.</li>
          <li>Agrega 5 gotas de vinagre blanco.</li>
          <li>Agrega una gota de aceite esencial de clavo y mezcla.</li>
          <li>Filtra con una gasa de algodón o muselina.</li>
          <li>Embotella y refrigera cuando no la uses; si sale moho, deséchala.</li>
          <li>Coloca un poco de pigmento en polvo en un plato de cerámica o paleta de vidrio.</li>
          <li>Agrega la emulsión gota a gota y mezcla con una espátula o moleta hasta que tenga una textura suave, sin sensación arenosa. Agrega tanta emulsión como necesites.</li>
          <li>Pinta inmediatamente en capas finas, una sobre otra, dejando secar entre cada capa. No funciona bien para impastos o capas gruesas, ya que se cuartean al secar.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
