import { Link } from '@inertiajs/react'
import ManualLayout from '@/components/ManualLayout'
import { MaterialList, Material } from '@/components/manual/MaterialList'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <MaterialList>
        <Material term="Jabón de ropa neutro">Cualquier jabón sin perfumes, suavizantes, enzimas ni blanqueadores. Funciona el jabón de coco puro, el jabón de Marsella, el jabón de Castilla, o detergentes específicos para lana. Evita los detergentes comerciales perfumados ya que interfieren con el tinte.</Material>
        <Material term="Vinagre blanco" />
        <Material term="Carbonato de sodio">Para lavar profundamente las fibras. Podrás encontrar <Link href="/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-sodio" className="underline text-orange-ink hover:text-orange">una receta</Link> más adelante en esta sección.</Material>
        <Material term="Alumbre potásico para fijar el color">Ya sea en polvo o en piedra, lo puedes encontrar en farmacias, tiendas naturistas, herbolarias y mercados.</Material>
        <Material term="Crémor tártaro">Se usa para mejorar el color en lana o seda y lo puedes encontrar en tiendas de repostería.</Material>
        <Material term="Tela o hilo de origen natural como seda, lana, lino o algodón" />
        <Material term="Colorantes naturales">Consulta el <Link href="/manual-del-color-vivo/atlas-del-color" className="underline text-orange-ink hover:text-orange">atlas del color</Link> al final del manual.</Material>
        <Material term="Sulfato ferroso heptahidratado">Se usa para modificar el color. Lo puedes conseguir en tiendas de jardinería. (se vende como corrector de hierro para plantas)</Material>
      </MaterialList>
    </ManualLayout>
  )
}
