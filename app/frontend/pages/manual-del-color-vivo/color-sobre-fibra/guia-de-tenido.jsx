import { Link } from '@inertiajs/react'
import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'
import { MaterialList, Material } from '@/components/manual/MaterialList'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>No todo lo que tiene color sirve para teñir. Para que un material funcione como tinte, debe contener grupos químicos capaces de fijarse a la fibra a través de un mordiente. El aluminio es el puente que une el colorante con la fibra y hace que el color dure.</p>
      <p>Los compuestos tintóreos que uso en este libro se agrupan en grupos químicos. Saber cuál predomina en cada material te ayuda a predecir qué color va a dar, cómo se va a comportar en la olla y qué tanto va a durar. No hace falta que te los aprendas de memoria —al final del libro, en <Link href="/manual-del-color-vivo/atlas-del-color" className="underline text-orange-ink hover:text-orange">Atlas del color</Link>, encontrarás más plantas e insectos con el color que producen—. Esto es solo una referencia general.</p>
      <p>Los grupos químicos del color más usados para teñir son:</p>
      <MaterialList>
        <Material term="Quinonas">rojos, marrones, morados y algunos amarillos. Henna, Rubia tinctorum, cáscara de nogal, ruibarbo, grana cochinilla, quermes.</Material>
        <Material term="Flavonoides">amarillos, anaranjados, algunos ocres y beiges. Gualda, solidago, Tagetes.</Material>
        <Material term="Homoisoflavonoides">rojos, morados y negros. Palo de Brasil, palo de Campeche.</Material>
        <Material term="Carotenoides">anaranjados. Achiote, azafrán.</Material>
        <Material term="Alcaloides">amarillos, morado. Calafate, palo amarillo, mano de león, colorín, muicle.</Material>
        <Material term="Curcuminoides">amarillos. Cúrcuma.</Material>
        <Material term="Taninos">marrones, amarillos y beige. Además, actúan como mordientes naturales. Agallas de roble, eucalipto, cáscara de granada, cáscara de aguacate, cáscara de cebolla, quebracho.</Material>
        <Material term="Indigoides">azules. Añil, jiquilite, glasto.</Material>
      </MaterialList>
      <p>No incluyo en esta lista a las antocianinas ni las betalaínas —responsables de muchos rojos, morados, magentas y azules en la naturaleza, como los de la col morada, las moras, la Jamaica, el betabel o la tuna—. Son muy sensibles a la luz y al pH: el color migra, se apaga o vira en cuestión de días. Yo considero que no valen la energía ni el material para teñir textiles; sé que a veces son populares en internet, pero creo que es mejor consumirlas.</p>
      <p>Todos los colorantes de este libro se extraen con calor, excepto el índigo. Las plantas y la grana cochinilla comparten procedimiento: ambos contienen compuestos tintóreos que se extraen poniendo el material en agua caliente durante aproximadamente una hora, y luego se introduce al tinte la fibra previamente lavada y mordentada. La diferencia está en la proporción: las plantas se usan al 100% respecto al peso de la fibra si el material está seco, o al 200% si es fresco; la cochinilla, entre el 3% y el 25% dependiendo de la intensidad que busques. Esa variación, y otros procesos específicos los explico en los capítulos <Link href="/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas" className="underline text-orange-ink hover:text-orange">Teñir con plantas</Link> y <Link href="/manual-del-color-vivo/color-sobre-fibra/tenir-con-grana-cochinilla" className="underline text-orange-ink hover:text-orange">Teñir con grana cochinilla</Link>.</p>
      <p>El índigo no se extrae por calor ni necesita mordiente; funciona mediante un proceso de reducción y oxidación en una tina alcalina. Es un método completamente distinto y lo cubro en el capítulo <Link href="/manual-del-color-vivo/color-sobre-fibra/tenir-con-indigo" className="underline text-orange-ink hover:text-orange">Teñir con índigo</Link>.</p>
      <p>En este manual no incluyo el uso del caracol púrpura. El Plicopurpura pansa produce morados profundos que han teñido textiles en las costas mesoamericanas desde mucho antes de la colonia. Hoy su extracción está protegida legalmente y reservada a los pueblos originarios que han sostenido la técnica durante siglos, particularmente los mixtecos de Pinotepa de Don Luis, en Oaxaca, que lo trabajan sin matar al caracol, devolviéndolo al mar después de extraer el tinte. No me corresponde comentar esa técnica ni transmitir ese conocimiento. Si quieres acercarte al caracol púrpura, hazlo directamente con los artesanos que lo tiñen.</p>
      <p>Tampoco uso hongos ni líquenes para teñir. Algunos líquenes están en declive o en peligro: crecen milímetros por año y una vez que los cosechas, tardan décadas en regresar. Con los hongos pasa algo parecido: se necesita mucho material y no soy experta para identificarlos con seguridad. Ninguno de los dos lo tengo a mi alcance. Sé que hay artistas que trabajan con ellos y lo respeto mucho, pero yo no exploro esos materiales.</p>
      <p>Aunque lo hice por un tiempo, ya no uso tierras para teñir. No tengo manera de asegurarme de que estén libres de contaminantes o metales pesados, y prefiero no arriesgar en fibras que van a estar en contacto con la piel. Las utilizo para pintar y dibujar; encontrarás más información en las siguientes secciones: <Link href="/manual-del-color-vivo/pigmento-y-polvo" className="underline text-orange-ink hover:text-orange">Pigmento y polvo</Link> y <Link href="/manual-del-color-vivo/color-en-movimiento" className="underline text-orange-ink hover:text-orange">Color en movimiento</Link>.</p>
    </ManualLayout>
  )
}
