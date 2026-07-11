import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>La granada (Punica granatum) es probablemente el fruto más popular del Mediterráneo y Asia Central. Su nombre común significa manzana con muchas semillas en latín. Simboliza fertilidad, abundancia, belleza y vida eterna en la mitología griega y persa. Fue probablemente domesticada más de una vez en varios lugares de Irán, el Levante mediterráneo y Asia Occidental hace unos 8000 años. Era tan importante que dondequiera que llegaba se comía, su corteza y hojas se usaban con fines medicinales y la cáscara de su fruto para extraer color.</p>
      <p>Las flores del árbol y la piel de sus frutos tienen un alto contenido en taninos complejos, lo cual lo hace un tinte directo que puede usarse para teñir sin mordiente. Su uso como tinte más antiguo data del período neobabilónico y ha sido utilizado para teñir durante milenios.</p>
      <p>Se pueden obtener amarillos cálidos, y con la ayuda de modificadores también grises y marrones.</p>
      <p>Aunque no requiere mordiente, yo prefiero mordentar antes para fijar todas las moléculas tintóreas que contiene. Como la granada es ya alta en taninos, omito el pretratamiento con ácido tánico. Si quieres llegar al gris, puedes agregar sulfato ferroso al tinte o aplicarlo en un baño posterior.</p>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">Materiales
         •   Camiseta 100% algodón             •   100 gramos de cáscara de
             (pesa aproximadamente 100             granada seca
             gramos)                               (200 g si está fresca)</pre>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">•   Jabón                             •   Olla</pre>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">•   10 gramos de alumbre              •   Agua
             potásico
             o acetato de aluminio             •   Fuente de calor</pre>
      <Recipe rendimiento={""} tiempo={"4 horas aproximadamente, 60 minutos activos."}>
        <Steps>
          <li>Lava la camiseta con agua tibia y jabón.</li>
          <li>Llena la olla con suficiente agua para que la camiseta quede cubierta y pueda moverse libremente. Ponla a fuego bajo y agrega el alumbre o el acetato de aluminio. Mezcla hasta disolverlo.</li>
          <li>Introduce la camiseta a la olla y mantén el fuego bajo durante una hora, moviendo constantemente.</li>
          <li>Deja que la camiseta se enfríe por al menos una hora o, de preferencia, toda la noche. Sácala y retira el exceso de agua.</li>
          <li>Vuelve a llenar la olla con agua y agrega la cáscara de granada, calientala a fuego bajo por una hora.</li>
          <li>Filtra las cáscaras conservando el tinte, agrega más agua si es necesario.</li>
          <li>Introduce la camiseta en el tinte y mueve constantemente durante al menos media hora a fuego bajo.</li>
          <li>Cuando termines de teñir, espera a que la fibra se enfríe lo suficiente para poder manipularla. No la dejes demasiado tiempo, porque puede mancharse. Después exprime y enjuaga solo con agua. Jamás uses jabón en este paso, pero sí puedes usar la lavadora.</li>
          <li>Tiéndela a la sombra.</li>
        </Steps>
        <SideNote>Para obtener gris verdoso, sumerge la fibra ya teñida en un baño con 1 gramo de sulfato ferroso disuelto en agua durante 10 minutos. Enjuaga y tiende a la sombra.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
