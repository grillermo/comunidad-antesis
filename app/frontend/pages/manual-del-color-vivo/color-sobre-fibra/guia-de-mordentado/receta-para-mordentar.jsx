import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'
import Table, { Th, Td } from '@/components/manual/Table'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Aquí reúno todos los pasos del mordentado en una sola receta. La puedes usar con cualquiera de los mordientes que vimos arriba, ajustando solo la fibra y el aditivo opcional. Una vez la hagas un par de veces, se vuelve rápida y casi intuitiva.</p>
      <Recipe tiempo="1 hora 15 minutos aproximadamente, 15 minutos activos. Lo ideal es mordentar un día antes de teñir, para que la fibra asiente el mordiente durante al menos 24 horas.">
        <Steps>
          <li>Mide las sales. En todos los casos, el aluminio se utiliza el 10% respecto al peso total de la fibra que quieras mordentar. Si la fibra es de seda o lana y no tiene ningún material vegetal en su composición, agrego el 1% del peso de la fibra en cremor tártaro.</li>
          <li>Disuelve las sales en suficiente agua caliente. No necesitas una proporción específica; solo calcula que el textil a teñir quede completamente cubierto y se mueva libremente.</li>
          <li>Introduce la fibra limpia y, dependiendo cada caso, calienta lo más que permita el textil por una hora. (ver temperaturas en las notas más abajo)</li>
          <li>Después, prefiero dejarlo remojando toda la noche para obtener mejores resultados, pero puedes utilizarlo en cuanto termines. Lo ideal es que pasen al menos 24 horas entre el mordentado y el teñido: la fibra “asienta” el mordiente y el color se fija mejor.</li>
          <li>Retira el exceso de agua, no lo enjuagues, y mantén el textil mojado hasta el momento de teñir. Algunas opciones son guardarlo en un frasco o bolsa de plástico y refrigerarlo un máximo 5 días, o congelarlo hasta que lo necesites. Lo importante es que no le crezca moho.</li>
        </Steps>
        <SideNote>Puedes reutilizar el agua para mordentar varias veces mientras sea el mismo tipo de material (vegetal o proteína). Solo vuelve a agregar la cantidad de sales correspondiente. Si notas que el agua está muy turbia o aparecen manchas blancas, es momento de cambiarla.</SideNote>
        <SideNote>El agua con alumbre se puede eliminar de forma segura a través del drenaje doméstico, siempre que esté conectado al sistema municipal. Evita desecharlo en cuerpos de agua o en drenajes que lleguen directamente a ellos.</SideNote>
      </Recipe>
      <p>Aquí te dejo ejemplos de cómo mordento cada textil.</p>
      <Table>
        <thead>
          <tr>
            <Th>Textil</Th>
            <Th>Material</Th>
            <Th>Base</Th>
            <Th>Peso total</Th>
            <Th>Mordiente</Th>
            <Th>Cantidad</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>Camiseta</Td>
            <Td>Algodón 100%</Td>
            <Td>Vegetal</Td>
            <Td>200 g</Td>
            <Td>10% Alumbre potásico o acetato de aluminio</Td>
            <Td>20 g</Td>
          </tr>
          <tr>
            <Td>Estambre</Td>
            <Td>Lana 100%</Td>
            <Td>Proteína</Td>
            <Td>120 g</Td>
            <Td>10% Alumbre potásico o sulfato de aluminio + 1% Cremor tártaro (opcional)</Td>
            <Td>12 g + 1 g Cremor tártaro</Td>
          </tr>
          <tr>
            <Td>Tela</Td>
            <Td>Lino 80% poliéster 20%</Td>
            <Td>Vegetal</Td>
            <Td>300 g</Td>
            <Td>10% Alumbre potásico o acetato de aluminio</Td>
            <Td>30 g</Td>
          </tr>
          <tr>
            <Td>Pañuelo</Td>
            <Td>Seda 100%</Td>
            <Td>Proteína</Td>
            <Td>50 g</Td>
            <Td>10% Alumbre potásico o sulfato de aluminio + 1% cremor tártaro (opcional)</Td>
            <Td>5 g + 0.5 g Cremor tártaro</Td>
          </tr>
          <tr>
            <Td>Vestido</Td>
            <Td>Cáñamo 100%</Td>
            <Td>Vegetal</Td>
            <Td>400 g</Td>
            <Td>10% Alumbre potásico o acetato de aluminio</Td>
            <Td>40 g</Td>
          </tr>
        </tbody>
      </Table>
      <SideNote>Procedimiento: Mide las sales, colócalas en una olla, agrega una taza de agua y ponla a fuego bajo. Cuando estén completamente disueltas, agrega suficiente agua, revuelve bien e introduce la fibra en la olla, moviéndola suavemente hasta que esté completamente cubierta de agua. Mantén a fuego bajo durante 60 minutos, girando las fibras ocasionalmente con cuidado.</SideNote>
      <SideNote>Si vas a mordentar seda, no permitas que el agua hierva.</SideNote>
      <SideNote>Deja enfriar, retira las fibras, elimina el exceso de agua y continúa con el teñido.</SideNote>
      <Table>
        <thead>
          <tr>
            <Th>Textil</Th>
            <Th>Material</Th>
            <Th>Base</Th>
            <Th>Peso total</Th>
            <Th>Mordiente</Th>
            <Th>Cantidad</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>Vestido</Td>
            <Td>Lyocell de bambú 100%</Td>
            <Td>Vegetal</Td>
            <Td>250 g</Td>
            <Td>10% Alumbre potásico, acetato de aluminio o triformato de aluminio</Td>
            <Td>25 g</Td>
          </tr>
          <tr>
            <Td>Suéter</Td>
            <Td>Lana 70% y Algodón 30%</Td>
            <Td>Proteína y vegetal</Td>
            <Td>300 g</Td>
            <Td>10% Alumbre potásico o triformato de aluminio. (No uso cremor tártaro es porque el algodón en la mezcla puede dañarse)</Td>
            <Td>30 g</Td>
          </tr>
        </tbody>
      </Table>
      <SideNote>Procedimiento: Mide las sales, colócalas en una olla o cubeta, agrega una taza de agua hirviendo. Cuando estén completamente disueltas, agrega suficiente agua, revuelve bien e introduce la fibra moviéndola suavemente hasta que esté completamente cubierta de agua. Déjala sumergida por 4 días si utilizaste alumbre potásico o acetato de aluminio y 4 horas si utilizaste triformato de aluminio.</SideNote>
      <SideNote>Retira las fibras, elimina el exceso de agua y continúa con el teñido.</SideNote>
    </ManualLayout>
  )
}
