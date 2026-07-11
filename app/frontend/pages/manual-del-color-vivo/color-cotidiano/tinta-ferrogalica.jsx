import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Las tintas ferrogálicas son tintas a base de agua hechas con sales de hierro, ácido tánico o gálico, y una goma natural como aglutinante. Su uso comenzó alrededor del siglo IV. Por ser permanente, fácil de elaborar y resistente al agua, sustituyó a las tintas de carbón y se volvió la tinta de escritura más usada en el mundo occidental desde el siglo XII hasta principios del siglo XX. Con tinta ferrogálica se escribieron manuscritos medievales, registros legales, partituras, archivos de gobierno, y muchos de los dibujos y obras de arte.</p>
      <p>Tradicionalmente se utilizan agallas de roble, unos crecimientos esféricos que aparecen en los robles cuando una avispa deposita sus huevos bajo la corteza. Las agallas son una rica fuente de taninos: compuestos vegetales de color amarillo parduzco y sabor astringente. Los taninos se encuentran también en la corteza y las hojas del roble, y en las hojas de té, las nueces, y en otras cortezas y hojas.</p>
      <p>Las moléculas de tanino se unen con iones metálicos como el hierro y forman compuestos complejos que revelan un color oscuro al oxidarse en contacto con el aire. Existen muchas fórmulas para elaborarlas, pero aquí te dejo una receta básica con la que puedes comenzar a experimentar. Puedes usar agallas de roble en polvo, ácido tánico, hojas de eucalipto, yerba mate, té negro, cáscaras de granada o cáscaras de nogal negro.</p>
      <Recipe rendimiento={"80 ml de tinta concentrada."} tiempo={"1 semana de remojo más 30 minutos de preparación aproximadamente."}>
        <Steps>
          <li>Pon a remojar 30 gramos de material vegetal alto en taninos en 90 ml de agua hirviendo en un frasco con tapa.</li>
          <li>Tápalo bien y déjalo reposar por 1 semana.</li>
          <li>Filtra el líquido con una gasa de algodón o muselina.</li>
          <li>Agrega 1 gramo de sulfato ferroso y mezcla; verás cómo el líquido se oscurece de inmediato.</li>
          <li>Agrega 1 gramo de goma arábiga y mezcla.</li>
          <li>Agrega 1 gota de aceite esencial de clavo y mezcla.</li>
          <li>Envasa en un frasco con tapa.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
