import ManualLayout from '@/components/ManualLayout'
import { MaterialList, Material } from '@/components/manual/MaterialList'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El palo de Campeche (Haematoxylum campechianum) es un árbol nativo de la península de Yucatán. Su nombre en maya es “ek”, que significa negro y su nombre científico viene del griego haima (sangre) y xylon (madera): “madera que sangra”. De su corazón se extrae la hematoxilina, su principal molécula tintórea, acompañada de taninos y otros colorantes que aún no han sido del todo identificados.</p>
      <p>Era usado en tiempos precolombinos por los mayas para teñir telas de algodón y pintar la piel, pero se volvió especialmente codiciado durante la Colonia por obtener un negro profundo, que hasta entonces era casi imposible de lograr. Debido a su alta demanda, era interceptado y hurtado de depósitos y embarcaciones por piratas; provocó disputas entre España e Inglaterra que marcaron el establecimiento de Honduras Británica, hoy Belice.</p>
      <p>Felipe II de España adoptó el negro como símbolo de su inmenso poder, convirtiéndolo en expresión de máxima elegancia. Para el siglo XIX, todos los miembros de la alta sociedad, clase media, jueces, sacerdotes y abogados usaban negro obtenido de palo de Campeche.</p>
      <p>El fenómeno, conocido como marée noire (marea negra), se volvió todavía más pronunciado y, de cierta manera, continúa hasta el día de hoy.</p>
      <p>El palo de Campeche, además, produce azules, lavandas, morados, grises y un tinte negro muy duradero y resistente a la luz. Tiñe intensamente los núcleos de las células, por lo que se utiliza en histología hasta el día de hoy.</p>
      <p>La explotación intensiva de este árbol dejó cicatrices en los bosques de la península, así que para trabajar con él debes obtenerlo de proveedores que tengan certificación de manejo sustentable.</p>
      <p>Para esta receta puedes jugar con la intensidad del tinte diluyéndolo en más agua o con modificadores de color.</p>
      <MaterialList>
        <Material term="Madeja 100% lana (pesa aproximadamente 100 gramos)" />
        <Material term="Jabón" />
        <Material term="10 gramos de alumbre potásico o sulfato de aluminio" />
        <Material term="1 gramo de cremor tártaro" />
        <Material term="1 gramo de sulfato ferroso" />
        <Material term="100 gramos de palo de Campeche" />
        <Material term="Olla" />
        <Material term="Agua" />
        <Material term="Fuente de calor" />
      </MaterialList>
      <Recipe tiempo="16 horas aproximadamente, 2 horas de trabajo activo.">
        <Steps>
          <li>Remoja el palo de Campeche en suficiente agua durante al menos 12 horas.</li>
          <li>Lava la madeja con agua tibia y jabón.</li>
          <li>Llena la olla con suficiente agua, calcula que la fibra quede completamente cubierta y se mueva libremente. Ponla a fuego bajo y agrega los mordientes. Mezcla hasta disolverlos.</li>
          <li>Introduce la madeja a la olla y mantén el fuego bajo durante una hora, moviendola constantemente y revisando que la temperatura no suba de 80-85°C.</li>
          <li>Deja que la madeja se enfríe por al menos una hora o, de preferencia, toda la noche. Sácala y retira el exceso de agua.</li>
          <li>Vuelve a llenar la olla con suficiente agua y agrega el palo de Campeche junto con el agua de remojo. Hierve a fuego bajo por una hora.</li>
          <li>Filtra la madera conservando el tinte, agrega más agua si es necesario; calcula que la fibra quede completamente cubierta y se mueva libremente.</li>
          <li>Introduce la fibra en el tinte y mueve constantemente durante al menos media hora a fuego bajo. Cuida que la temperatura del agua no suba de 80-85°C.</li>
          <li>Cuando termines de teñir, espera a que la fibra se enfríe lo suficiente para poder manipularla. No la dejes ahí demasiado tiempo, porque puede mancharse. Después exprime y enjuaga solo con agua. Jamás uses jabón en este paso, pero sí puedes usar la lavadora.</li>
          <li>Tiéndela a la sombra.</li>
        </Steps>
        <SideNote>Si quieres llevar el color a gris oscuro o negro, sumerge la fibra ya teñida en un baño con 1 gramo de sulfato ferroso disuelto en agua durante 10 minutos. Enjuaga y tiende</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
