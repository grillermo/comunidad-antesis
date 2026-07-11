import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El carbonato de sodio es un compuesto inorgánico que se encuentra en la naturaleza como un mineral. Es la sustancia alcalina más utilizada desde la antigüedad. Yo lo utilizo para lavar a profundidad textiles —proceso conocido como descrudado— y para convertir un tinte líquido en pigmento en polvo. Lo puedes conseguir en internet, en tiendas naturistas, o convertir bicarbonato de sodio en carbonato con las siguientes instrucciones. Puedes utilizar las herramientas de tu cocina, pero lávalas muy bien al terminar.</p>
      <Callout>
        <p>El carbonato de sodio no es tóxico, pero al ser alcalino, es muy irritante. Cuando lleves a cabo esta receta, evita inhalar los vapores, utiliza mascarilla, guantes de hule y trabaja al aire libre o con las ventanas abiertas y el extractor de cocina encendido. Una vez que esté listo, mantenlo fuera del alcance de los niños y animales. No debe ingerirse ni tocarse directamente con las manos.</p>
      </Callout>
      <Recipe rendimiento="por cada 3 cucharadas de bicarbonato obtienes 2 de carbonato." tiempo="10 a 15 minutos aproximadamente.">
        <Steps>
          <li>Coloca una olla o sartén de acero inoxidable a fuego medio.</li>
          <li>Cuando esté caliente, agrega 3 cucharadas de bicarbonato de sodio y mezcla continuamente con una espátula de madera para evitar que el polvo se pegue o se caliente de más.</li>
          <li>Aparecerán pequeñas burbujas. Cuando desaparezcan, es momento de apagar y retirar del fuego. En total, deberá tomarte unos 5 minutos.</li>
          <li>Cuando el polvo esté frío, guárdalo en un frasco con tapa.</li>
        </Steps>
        <SideNote>Al calentarse, el bicarbonato de sodio (NaHCO₃) libera agua y dióxido de carbono y se transforma en carbonato de sodio (Na₂CO₃). Por eso su comportamiento cambia tanto. Cualquier recipiente que resista el calor directo funciona; el acero inoxidable es el más cómodo porque no reacciona y se limpia fácil.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
