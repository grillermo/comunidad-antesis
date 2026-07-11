import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El carbonato de calcio es un compuesto químico muy común en la naturaleza. Existe en depósitos naturales, conchas de mar, caracoles y cascarones de huevo, entre muchas otras formas. Ha sido utilizado en contextos muy distintos a lo largo de la historia: en la construcción, en la medicina, en la cocina y en el arte. En el color específicamente, ha servido como pigmento blanco, como base para preparar superficies de pintura, como ingrediente para fabricar pigmentos y como modificador del pH en procesos de teñido. En este manual lo utilizaremos para intensificar el color de algunos tintes, estabilizar el teñido, convertir un tinte líquido en pigmento en polvo y para preparar material de arte. Lo puedes conseguir en internet, droguerías o prepararlo por tu cuenta con herramientas de tu cocina.</p>
      <Recipe rendimiento="4 o 5 cucharadas de polvo fino a partir de 12 cascarones." tiempo="1 hora de trabajo activo aproximadamente, más 12 a 36 horas de secado.">
        <Steps>
          <li>Lava bien al menos 12 cascarones de huevo; pueden ser blancos o marrones.</li>
          <li>Déjalos remojando en agua con vinagre blanco en partes iguales hasta que se despegue la membrana interna del cascarón. Esto tomará unos 20 minutos.</li>
          <li>Retira las membranas y enjuaga los cascarones para que no tengan restos de vinagre.</li>
          <li>Hierve los cascarones en agua por 10 minutos, enjuaga y escurre el agua.</li>
          <li>Coloca los cascarones en un recipiente de licuadora y agrega aproximadamente 5 cucharadas de agua destilada o agua filtrada por cascarón entero.</li>
          <li>Licua esta mezcla por aproximadamente 5 minutos a velocidad media. Debes obtener una consistencia parecida al yogurt; agrega más agua destilada si hace falta.</li>
          <li>Obtendrás mejores resultados utilizando una moleta y una placa de vidrio para asegurarte de que la textura arenosa desaparezca.</li>
          <li>Filtra esta mezcla y déjala secar en filtros de café.</li>
          <li>Cuando la pasta esté completamente seca, muele con un mortero hasta obtener un polvo fino.</li>
          <li>Guárdalo en un lugar fresco y seco.</li>
        </Steps>
        <SideNote>El cascarón de huevo es 94% carbonato de calcio, así que puedes usarlo en las mismas proporciones en todas las recetas de este manual.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
