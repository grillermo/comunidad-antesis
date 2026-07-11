import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Aquí reúno todos los pasos del mordentado en una sola receta. La puedes usar con cualquiera de los mordientes que vimos arriba, ajustando solo la fibra y el aditivo opcional. Una vez la hagas un par de veces, se vuelve rápida y casi intuitiva.</p>
      <p>Procedimiento</p>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">Tiempo: 1 hora      1. Mide las sales. En todos los casos, el aluminio
      15 minutos             se utiliza el 10% respecto al peso total de la
      aproximadamente,
                             fibra que quieras mordentar. Si la fibra es de
      15 minutos
      activos. Lo ideal      seda o lana y no tiene ningún material vegetal
      es mordentar           en su composición, agrego el 1% del peso de
      un día antes de        la fibra en cremor tártaro.
      teñir, para que
      la fibra asiente
      el mordiente        2. Disuelve las sales en suficiente agua caliente.
      durante al menos       No necesitas una proporción específica; solo
      24 horas.              calcula que el textil a teñir quede completamente cubierto y se mueva libremente.</pre>
      <p>3. Introduce la fibra limpia y, dependiendo cada caso, calienta lo más que permita el textil por una hora. (ver temperaturas en las notas más abajo)</p>
      <p>4. Después, prefiero dejarlo remojando toda la noche para obtener mejores resultados, pero puedes utilizarlo en cuanto termines. Lo ideal es que pasen al menos 24 horas entre el mordentado y el teñido: la fibra “asienta” el mordiente y el color se fija mejor.</p>
      <p>5. Retira el exceso de agua, no lo enjuagues, y mantén el textil mojado hasta el momento de teñir. Algunas opciones son guardarlo en un frasco o bolsa de plástico y refrigerarlo un máximo 5 días, o congelarlo hasta que lo necesites. Lo importante es que no le crezca moho.</p>
      <p>Puedes reutilizar el agua para mordentar varias veces mientras sea el mismo tipo de material (vegetal o proteína). Solo vuelve a agregar la cantidad de sales correspondiente. Si notas que el agua está muy turbia o aparecen manchas blancas, es momento de cambiarla.</p>
      <p>El agua con alumbre se puede eliminar de forma segura a través del drenaje doméstico, siempre que esté conectado al sistema municipal. Evita desecharlo en cuerpos de agua o en drenajes que lleguen directamente a ellos.</p>
      <p>Aquí te dejo ejemplos de cómo mordento cada textil.</p>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">Peso
      Textil     Material     Base                   Mordiente              Cantidad
                                         total
                                                     10% Alumbre po-
      Cami-      Algodón
                              Vegetal    200 g       tásico o acetato de    20 g
      seta       100%
                                                     aluminio
                                                     10% Alumbre
                                                                            12 g +
                                                     potásico o sulfato
      Estam-     Lana                                                       1g
                              Proteína   120 g       de aluminio + 1%
      bre        100%                                                       Cremor
                                                     Cremor tártaro
                                                                            tártaro
                                                     (opcional)
                 Lino
                                                     10% Alumbre po-
                 80%
      Tela                    Vegetal    300 g       tásico o acetato de    30 g
                 poliéster
                                                     aluminio
                 20%
                                                     10% Alumbre
                                                     potásico o sulfato     5 g + 0.5
                 Seda
      Pañuelo                 Proteína 50 g          de aluminio + 1%       g Cremor
                 100%
                                                     cremor tártaro         tártaro
                                                     (opcional)
                                                     10% Alumbre
                 Cáñamo
      Vestido                 Vegetal    400 g       potásico o acetato     40 g
                 100%
                                                     de aluminio</pre>
      <p>Procedimiento: Mide las sales, colócalas en una olla, agrega una taza de agua y ponla a fuego bajo. Cuando estén completamente disueltas, agrega suficiente agua, revuelve bien e introduce la fibra en la olla, moviéndola suavemente hasta que esté completamente cubierta de agua. Mantén a fuego bajo durante 60 minutos, girando las fibras ocasionalmente con cuidado.</p>
      <p>Si vas a mordentar seda, no permitas que el agua hierva.</p>
      <p>Deja enfriar, retira las fibras, elimina el</p>
      <p>exceso de agua y continúa con el teñido.</p>
      <p>Peso Textil Material Base Mordiente Cantidad total</p>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">Lyocell                         10% Alumbre pode                              tásico, acetato de
      Vestido               Vegetal    250 g                          25 g
                bambú                           aluminio o trifor-
                100%                            mato de aluminio</pre>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">10% Alumbre potásico o triformato de
                Lana                            aluminio.
                            Proteína
                70%                             (No uso cremor
      Suéter                y        300 g                           30 g
                Algodón                         tártaro es porque
                            vegetal
                30%                             el algodón en la
                                                mezcla puede
                                                dañarse)</pre>
      <p>Procedimiento: Mide las sales, colócalas en una olla o cubeta, agrega una taza de agua hirviendo. Cuando estén completamente disueltas, agrega suficiente agua, revuelve bien e introduce la fibra moviéndola suavemente hasta que esté completamente cubierta de agua. Déjala sumergida por 4 días si utilizaste alumbre potásico o acetato de aluminio y 4 horas si utilizaste triformato de aluminio.</p>
      <p>Retira las fibras, elimina el exceso de agua y continúa con el teñido.</p>
    </ManualLayout>
  )
}
