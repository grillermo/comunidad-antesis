import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El gouache es una pintura opaca a base de agua, similar a la acuarela, pero con mayor cubrimiento. La técnica es muy antigua: se usaba en el antiguo Egipto, en las miniaturas persas e indias, fue común en los manuscritos iluminados medievales europeos y se utilizó en estudios de naturaleza durante el Renacimiento. El nombre “gouache” se empezó a usar en Francia en el siglo XVIII, derivado del italiano guazzo, que significa “lodo”, por la consistencia espesa de la pintura. El carbonato de calcio o un pigmento blanco le dan su opacidad característica; sin ellos, la pintura sería transparente como la acuarela. En el siglo XIX se volvió fundamental para la ilustración comercial, el diseño de carteles y publicidad. Funciona bien sobre papel, cartón y madera.</p>
      <Recipe rendimiento={"165ml de base."} tiempo={"15 minutos aproximadamente."}>
        <Steps>
          <li>Mezcla 45 gramos de goma arábiga en 90 ml de agua caliente hasta que se disuelva completamente.</li>
          <li>Agrega 30 gramos de miel de abeja o glicerina y mezcla.</li>
          <li>Agrega 2 gotas de aceite esencial de clavo, mezcla y aparta. Esta será tu base de gouache; puedes refrigerarla en un frasco con tapa. Tiene duración indefinida, pero si le sale moho, deséchala.</li>
          <li>Coloca 5 gramos del pigmento en polvo de tu elección en un plato de cerámica o paleta de vidrio y mézclalo con 5 gramos de carbonato de calcio.</li>
          <li>Agrega 10 gramos de la base de gouache y mezcla bien con una cuchara o espátula; puedes agregar más base hasta obtener la textura deseada.</li>
          <li>Usa inmediatamente.</li>
          <li>Puedes almacenar la pintura sobrante en un frasco con tapa dentro del refrigerador o secarla en pastillas de acuarela vacías para reusarla después.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
