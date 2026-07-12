import { Link } from '@inertiajs/react'
import ManualLayout from '@/components/ManualLayout'
import { MaterialList, Material } from '@/components/manual/MaterialList'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <MaterialList>
        <Material term="Carbonato de calcio">Se usa para obtener pigmentos opacos. Podrás encontrar <Link href="/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-calcio" className="underline text-orange-ink hover:text-orange">una receta</Link> más adelante en esta sección.</Material>
        <Material term="Carbonato de sodio">Sirve para obtener pigmentos translúcidos. Podrás encontrar <Link href="/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-sodio" className="underline text-orange-ink hover:text-orange">una receta</Link> más adelante en esta sección.</Material>
        <Material term="Alumbre potásico">Ya sea en polvo o en piedra, sirve para precipitar un tinte. Lo puedes encontrar en farmacias, tiendas naturistas, herbolarias y mercados. Yo prefiero utilizar el de grado alimenticio.</Material>
        <Material term="Agua destilada">Funciona mejor que el agua de la llave para obtener pigmentos puros. También te recomiendo usar agua de lluvia o agua filtrada.</Material>
        <Material term="Filtros de café de papel" />
      </MaterialList>
    </ManualLayout>
  )
}
