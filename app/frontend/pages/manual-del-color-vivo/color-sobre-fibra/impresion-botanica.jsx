import { Link } from '@inertiajs/react'
import ManualLayout from '@/components/ManualLayout'
import { MaterialList, Material } from '@/components/manual/MaterialList'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>La impresión botánica es una técnica artística y artesanal que utiliza el calor para transferir los colores naturales de hojas, flores y otras partes de plantas directamente sobre tela o papel. Esta técnica aprovecha particularmente los taninos y las moléculas con propiedades tintóreas propias de las plantas. También se conoce como ecoprint, o impresión ecológica, y forma parte de las prácticas de teñido natural.</p>
      <p>La técnica de impresión botánica es muy libre e intuitiva. No hay una manera absoluta de hacerla y los resultados son siempre diferentes. Aunque se utilicen las mismas fórmulas, los colores pueden cambiar dependiendo del tipo de agua, las herramientas, los mordientes, la técnica, los soportes, del método de cocción y la temporada del año.</p>
      <MaterialList>
        <Material term="Tela 100% natural, previamente lavada o descrudada y mordentada con sales de aluminio." />
        <Material term={<>Hojas, flores u otro material tintóreo (preferentemente de la sección “<Link href="/manual-del-color-vivo/atlas-del-color" className="underline text-orange-ink hover:text-orange">Atlas del color</Link>”)</>} />
        <Material term="Un cilindro para enrollar: tubo metálico, lata de aluminio o palo de bambú." />
        <Material term="Hilo o hilaza resistente al calor." />
        <Material term="Bolsa de plástico o tela vieja como barrera (opcional, para resultados más definidos)." />
        <Material term="Olla grande con rejilla para vapor, u olla honda para hervir." />
      </MaterialList>
      <Recipe tiempo="3 a 4 horas aproximadamente, 1 hora de trabajo activo.">
        <Steps>
          <li>Lavar o descrudar la tela, según sea el caso.</li>
          <li>Mordentar la tela con sales de aluminio.</li>
          <li>Colocar hojas, flores o material tintóreo sobre la tela. Identifica muy bien lo que vas a usar y prefiere plantas de la sección “<Link href="/manual-del-color-vivo/atlas-del-color" className="underline text-orange-ink hover:text-orange">Atlas del color</Link>”.</li>
          <li>Enrolla la tela firmemente alrededor de un cilindro y sujeta con hilo o hilaza. Puedes usar un tubo metálico, una lata de aluminio o palos de bambú.</li>
          <li>Somete el rollo a vapor o hiérvelo durante al menos 30 minutos. Si usas hojas duras como las del eucalipto, extiende el tiempo hasta 90 minutos.</li>
          <li>Espera a que se enfríe y desenrolla; aparecerán siluetas y colores transferidos.</li>
          <li>Opcionalmente, puedes introducir la tela en un baño de sulfato ferroso para oscurecer los taninos de amarillo claro al gris o al verde. Prepara una cubeta con suficiente agua tibia y disuelve sulfato ferroso al 1% del peso del textil. (Revisa la sección de <Link href="/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/sulfato-ferroso" className="underline text-orange-ink hover:text-orange">Sulfato ferroso</Link> en Modificadores y tratamientos de color)</li>
          <li>Introduce la fibra ya teñida durante un máximo de 10 minutos y muévela constantemente con una pala de madera hasta que te guste el color.</li>
          <li>Retira y enjuaga (asegúrate de usar guantes). Para este paso no uso la lavadora ya que puede afectar el metal de la máquina.</li>
          <li>Si decides hacer este baño, es necesario neutralizar la fibra colocándola en agua con una taza de vinagre blanco durante 20 minutos.</li>
          <li>Enjuaga una vez más y tiende a la sombra. Para este paso sí puedes usar la lavadora.</li>
          <li>Exprime y tiende la sombra.</li>
        </Steps>
        <SideNote>Usa fibras 100% naturales. Si utilizas una tela con fibras sintéticas como poliéster, rayón, nailon o acrílico, las formas y el color resultarán apagados, inestables, borrosos y disparejos.</SideNote>
        <SideNote>Para esta técnica puedes usar papel para transferir motivos. Te recomiendo papel de acuarela o uno de gramaje mínimo 120 g/m². No es absolutamente necesario que lo mordientes, pues no lo vamos a lavar, pero si quieres experimentar con diferentes mordientes o modificadores de color, puedes remojarlo previamente en 100 ml de agua con 1 g de alumbre, en leche de soya o en 100 ml de agua con 1 g de sulfato ferroso durante 10 minutos. Documenta todos los resultados y variaciones para que puedas repetir el procedimiento.</SideNote>
        <SideNote>Las formas vaporizadas suelen ser más definidas, pero pueden necesitar más tiempo de cocción (alrededor de 90 minutos).</SideNote>
        <SideNote>Los colores hervidos suelen ser más intensos, pero se expanden.</SideNote>
        <SideNote>Las flores suelen necesitar menos tiempo de cocción (alrededor de 30 minutos) y muchas veces sobrecalentarlas elimina su color.</SideNote>
        <SideNote>Las hojas de árboles, especialmente las de eucalipto, conviene remojarlas en agua con una taza de vinagre durante al menos media hora antes de usarse y suelen requerir más tiempo de cocción (alrededor de 90 minutos).</SideNote>
        <SideNote>Puedes repetir la cocción cuantas veces quieras. Haz pruebas con diferentes tiempos para encontrar lo que te gusta.</SideNote>
        <SideNote>Colocar bolsas de plástico o algún otro tipo de barrera encima de la tela y las flores u hojas antes de enrollarla hará que los resultados sean más definidos y limpios. Si no pones nada, obtendrás formas más abstractas y con transparencias porque los colores se traspasarán a las capas de la tela.</SideNote>
        <SideNote>Hay muchos materiales que puedes utilizar para enrollar la tela; palos de madera, tubos de metal, latas de aluminio. Su rigidez, su capacidad de conducir el calor, su composición y su reacción con los mordientes cambiarán los resultados.</SideNote>
        <SideNote>En botánica, se llama “haz” a la cara superior o cara adaxial del limbo de la hoja de una planta. Es también conocida como lado del sol. Se diferencia del “envés”, que es la parte de abajo de una hoja; por lo general posee menos estomas. Tiene una cutícula más gruesa y posee menor abundancia de tricomas. Este lado es conocido como lado de la luna. Esto es importante porque el envés suele ser más alto en taninos y resultar en más color.</SideNote>
        <SideNote>Las plantas con más taninos son las que se podan estando todavía verdes o frescas; puedes ponerlas a secar y conservarán los taninos.</SideNote>
        <SideNote>Dependiendo de la especie de eucalipto que utilices, la temporada del año y la salud del árbol, puedes obtener colores que van del marrón a los amarillos y rojizos.</SideNote>
        <SideNote>El sulfato ferroso oscurece únicamente las moléculas de taninos presentes en las hojas; por eso deja pequeños puntos en lugar de cubrir la hoja entera. La presencia de taninos puede variar dependiendo de la especie de planta, la temporada del año y la salud del árbol.</SideNote>
        <SideNote>Puedes utilizar una tela previamente teñida e imprimir motivos encima.</SideNote>
        <SideNote>Los colores y las formas obtenidas en seda o en fibras a base de proteína serán siempre mucho más sorprendentes y más definidos que los resultados obtenidos en algodón o lino. Como estas primeras telas suelen ser mucho más caras, te recomiendo hacer pruebas y comenzar a experimentar con algodón y telas a base de celulosa hasta que te sientas con más confianza.</SideNote>
      </Recipe>
      <p>Las primeras veces puede que tengas resultados terribles, muy claros, o muy manchados. Intenta hacer varios experimentos el mismo día con diferentes variantes, prueba algunas telas al vapor y otras hirviéndolas, a veces menos es más. Prueba haciendo dobleces para obtener reflejos y figuras abstractas más simétricas. Toma fotos antes, al desenrollar y cuando la tela se seque. Ten paciencia y toma muchas notas.</p>
    </ManualLayout>
  )
}
