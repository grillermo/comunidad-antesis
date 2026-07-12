import { Link } from '@inertiajs/react'
import ManualLayout from '@/components/ManualLayout'
import { MaterialList, Material } from '@/components/manual/MaterialList'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Hapa zome (葉っぱ染め) es un término japonés que significa “tinte de hojas”. Es una técnica muy sencilla que consiste en transferir material botánico fresco a tela o papel utilizando un martillo.</p>
      <p>Yo prefiero hacer esta técnica sobre papel, ya que en tela el color suele durar menos y cambia con cada lavada. Pero, como siempre, te recomiendo experimentar y sacar tus propias conclusiones con los materiales que tengas a tu alcance.</p>
      <MaterialList>
        <Material term="Martillo" />
        <Material term="Tabla de madera o piedra" />
        <Material term="Papel de 120 g a 300 g/m² o tela de origen natural previamente lavada y mordentada con aluminio." />
        <Material term="Cinta adhesiva transparente ancha (opcional, útil si trabajas sobre tela)." />
        <Material term="Diferentes hojas y flores frescas, aquí puedes usar cualquier planta, identifícalas bien y verifica su toxicidad antes de usarlas." />
        <Material term="Papel, tela vieja o plástico para cubrir los materiales mientras martillas." />
      </MaterialList>
      <Recipe tiempo="30 minutos a 1 hora aproximadamente, todo trabajo activo.">
        <Steps>
          <li>Coloca el material botánico sobre el papel o tela seca encima de la tabla.</li>
          <li>Cubre los materiales con otro trozo de papel, tela o plástico. Si vas a usar tela, la cinta adhesiva transparente y ancha es muy útil para que no se mueva.</li>
          <li>Martilla con golpes parejos y firmes hasta cubrir toda la superficie.</li>
          <li>Descubre la parte superior y retira las plantas con cuidado.</li>
        </Steps>
        <SideNote>Tradicionalmente, esta técnica se hacía sobre papel pretratado con leche de soya: se remojaba durante 10 minutos y se dejaba secar antes de imprimir. El pretratamiento ayuda a que los colores duren más, pero no es indispensable. Si quieres experimentar, hazlo y compara resultados.</SideNote>
        <SideNote>Prefiere plantas con propiedades tintóreas (revisa la sección “<Link href="/manual-del-color-vivo/atlas-del-color" className="underline text-orange-ink hover:text-orange">Atlas del color</Link>”). Las flores muy pigmentadas y las hojas tiernas dan mejores resultados que las hojas duras o secas.</SideNote>
        <SideNote>El diseño terminado se decolora con la luz solar directa. Guarda tus piezas lejos del sol o, si las vas a enmarcar, considera un vidrio con filtro UV.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
