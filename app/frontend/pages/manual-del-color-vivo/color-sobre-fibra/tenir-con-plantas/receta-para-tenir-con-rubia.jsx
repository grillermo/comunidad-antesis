import ManualLayout from '@/components/ManualLayout'
import { MaterialList, Material } from '@/components/manual/MaterialList'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>La rubia (Rubia tinctorum) fue usada por muchas civilizaciones antiguas, incluidos los egipcios, persas, indios, babilonios y más tarde los griegos, romanos y vikingos. Su fuente de color es un compuesto llamado alizarina que se concentra en las raíces y se acompaña de purpurina y otros derivados. Era uno de los pocos rojos disponibles para los artistas del pasado, y la naturaleza altamente translúcida de su pigmento de laca la hacía excelente para veladuras. En la Edad Media permitió producir ropa de color a un precio accesible. También se usó para teñir uniformes militares llamativos, como las famosas casacas rojas del ejército británico, que se utilizaban para intimidar al enemigo y distinguirse en el campo de batalla; sin embargo, cayeron en desuso a medida que se volvía más importante camuflajearse en la guerra.</p>
      <p>De la rubia se pueden obtener rosas pálidos y violetas, pasando por rojos, corales, anaranjados y marrones.</p>
      <p>Te comparto mi receta favorita para teñir con rubia para obtener rojos más brillantes en algodón y lino.</p>
      <MaterialList>
        <Material term="Tela 100% algodón o lino (pesa aproximadamente 100 gramos)" />
        <Material term="Jabón" />
        <Material term="10 gramos de ácido tánico" />
        <Material term="10 gramos de alumbre potásico o acetato de aluminio" />
        <Material term="5 gramos de carbonato de calcio" />
        <Material term="100 gramos de rubia" />
        <Material term="Olla" />
        <Material term="Agua" />
        <Material term="Fuente de calor" />
      </MaterialList>
      <Recipe tiempo="16 horas aproximadamente, 2 horas de trabajo activo.">
        <Steps>
          <li>Remoja la rubia en suficiente agua por al menos 12 horas.</li>
          <li>Lava la tela con agua caliente y jabón.</li>
          <li>Prepara un baño de taninos en una olla con 3 litros de agua caliente a 40 °C grados centígrados y agrega 30 gramos de ácido tánico. Disuelve bien.</li>
          <li>Introduce el textil, muévelo ocasionalmente y déjalo remojando durante 2 horas. No es necesario volver a calentarlo.</li>
          <li>Usa guantes para retirar el textil del agua. Puedes centrifugarlo en la lavadora o exprimirlo a mano, pero no lo enjuagues.</li>
          <li>Llena la olla con suficiente agua para que el textil quede cubierto y pueda moverse libremente. Ponla a fuego bajo y agrega el alumbre o el acetato de aluminio. Mezcla hasta disolverlo.</li>
          <li>Introduce el textil en la olla y mantén el fuego bajo durante una hora, moviéndolo constantemente.</li>
          <li>Deja que la fibra se enfríe en el tinte al menos una hora o, de preferencia, toda la noche. Sácala y retira el exceso de agua.</li>
          <li>Vuelve a llenar la olla con suficiente agua y agrega la rubia junto con el agua de remojo. Añade el carbonato de calcio y calienta a fuego bajo durante una hora, cuidando que el agua no llegue a hervir.</li>
          <li>Filtra la rubia conservando el tinte cuando aún esté caliente. Agrega más agua si es necesario.</li>
          <li>Introduce la fibra en el tinte y mueve constantemente durante al menos media hora a fuego bajo.</li>
          <li>Cuando termines de teñir, espera a que la fibra se enfríe lo suficiente para poder manipularla. No la dejes ahí demasiado tiempo, porque puede mancharse. Después exprime y enjuaga solo con agua. Jamás uses jabón en este paso, pero sí puedes usar la lavadora.</li>
          <li>Tiéndela a la sombra.</li>
        </Steps>
        <SideNote>Hay dos pasos clave que hacen esta receta especial para la rubia. Primero, agregar carbonato de calcio al baño de extracción para alcalinizar ligeramente el agua, lo que ayuda a liberar las moléculas de antraquinona y a fijar el color. Segundo, filtrar el material vegetal cuando el tinte aún está caliente, antes de introducir la fibra, para que las moléculas tintóreas no se reabsorban en las raíces o cortezas y permanezcan disponibles en el baño. No te los saltes.</SideNote>
        <SideNote>Si quieres llevar el color a violeta o marrón, sumerge la fibra ya teñida en un baño con 1 gramo de sulfato ferroso disuelto en agua durante 10 minutos. Enjuaga y tiende.</SideNote>
        <SideNote>La rubia pertenece a las Rubiáceas, una familia cuyos miembros comparten química tintórea (antraquinonas, taninos y otros compuestos en raíces y cortezas), por lo que con esta receta también puedes teñir con galio amarillo, rubia de la India y quina roja, para obtener rosas y anaranjados. Fuera de la familia, el ruibarbo y el tabachín enano también contienen antraquinonas y responden a la misma receta, aunque dan amarillos y ocres.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
