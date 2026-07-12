import { Link } from '@inertiajs/react'
import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Como te he contado a lo largo de este manual, para teñir con la mayoría de las plantas solo necesitas extraer su color en agua caliente. Sin embargo, quiero dejarte algunas <Link href="/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas/recomendaciones-antes-de-tenir" className="underline text-orange-ink hover:text-orange">recomendaciones antes de empezar</Link> y, a continuación, una <Link href="/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas/receta-general-para-tenir-con-plantas" className="underline text-orange-ink hover:text-orange">receta general</Link> que funciona como base. Después encontrarás tres recetas a modo de ejemplo —<Link href="/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas/receta-para-tenir-con-cascara-de-granada" className="underline text-orange-ink hover:text-orange">cáscara de granada</Link>, <Link href="/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas/receta-para-tenir-con-palo-de-campeche" className="underline text-orange-ink hover:text-orange">palo de Campeche</Link> y <Link href="/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas/receta-para-tenir-con-rubia" className="underline text-orange-ink hover:text-orange">rubia</Link>— para que te vayas familiarizando con el procedimiento.</p>
    </ManualLayout>
  )
}
