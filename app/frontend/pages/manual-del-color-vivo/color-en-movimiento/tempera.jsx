import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>La tempera al huevo es una de las pinturas más antiguas y permanentes que existen. Se usó en los retratos funerarios del antiguo Egipto y fue el medio principal de la iconografía bizantina y la pintura sobre tabla durante toda la Edad Media y el Renacimiento temprano. Seca casi al instante, tiene acabado mate, y es ideal para arte decorativo y pintura infantil. Funciona bien sobre lienzo, papel, cartón y madera.</p>
      <Recipe rendimiento={"25 ml de emulsión."} tiempo={"10 minutos aproximadamente. La emulsión sin pigmento se conserva una semana en refrigeración. No es posible guardar esta pintura una vez mezclada con pigmento."}>
        <Steps>
          <li>Separa la yema de un huevo y ponla en la palma de tu mano.</li>
          <li>Pasa la yema de una mano a otra con cuidado de no reventarla. Con la mano libre, retira los restos de clara hasta que la yema se sienta seca y completamente sin clara.</li>
          <li>Coloca la yema en un frasco pequeño con tapa.</li>
          <li>Agrega 20 ml de agua al frasco y agita hasta obtener una emulsión amarilla clara.</li>
          <li>Agrega una gota de aceite esencial de clavo y mezcla.</li>
          <li>Embotella y refrigera cuando no la uses; si sale moho, deséchala.</li>
          <li>Coloca un poco de pigmento en polvo en un plato de cerámica o paleta de vidrio.</li>
          <li>Agrega la emulsión gota a gota y mezcla con una espátula o moleta hasta que tenga una textura suave, sin sensación arenosa. Agrega tanta emulsión como necesites.</li>
          <li>Usa inmediatamente en capas finas, una sobre otra, dejando secar entre cada capa. No funciona bien para impastos o capas gruesas, ya que se cuartean al secar.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
