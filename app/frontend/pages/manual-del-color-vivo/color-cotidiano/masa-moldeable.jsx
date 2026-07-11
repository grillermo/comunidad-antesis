import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Esta es mi receta de masa favorita. Tiene una textura que entretiene a todo el mundo; me atrevo a decir que esta masa me convirtió en la persona favorita de mis primas menores. Es libre de colorantes artificiales y es muy fácil de hacer. Si la guardas en un frasco con tapa en el refrigerador, puede durar meses. Si notas que le crece moho, huele mal o le salen pequeñas manchas, tírala.</p>
      <p>Los colorantes que me gusta utilizar son: col morada para obtener azul cielo; cáscara de granada, cúrcuma o cáscara de cebolla para obtener amarillo; palo de Brasil para obtener magenta y palo de Campeche para obtener morado. Como todos son comestibles, puedes utilizar las herramientas de tu cocina.</p>
      <Recipe rendimiento={""} tiempo={"45 minutos aproximadamente."}>
        <Steps>
          <li>Coloca 50 gramos de materia vegetal en una olla con un litro de agua y ponlo a hervir a fuego bajo hasta que se reduzca a aproximadamente 250 ml (20 minutos, aproximadamente).</li>
          <li>Retira el material vegetal y aparta el tinte.</li>
          <li>Mezcla en otra olla 200 gramos de harina, 100 gramos de sal fina y 6 gramos de crémor tártaro; revuelve bien.</li>
          <li>Agrega 1 cucharada de aceite y mezcla. A mí me gusta usar aceite de coco, pero puedes usar cualquier aceite comestible.</li>
          <li>Agrega el tinte mientras calientas a fuego medio mezclando constantemente.</li>
          <li>Continúa revolviendo hasta que la masa espese y comience a formarse en una esfera.</li>
          <li>Retira del fuego y colócala en un plato o sobre papel encerado.</li>
          <li>Deja que se enfríe ligeramente para que puedas manipularla. Después, amásala mientras esté tibia hasta que quede suave.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
