import { Link } from '@inertiajs/react'
import ManualLayout from '@/components/ManualLayout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Antes de empezar, puedes preparar dos reactivos que se mencionan seguido en este manual: el carbonato de calcio y el carbonato de sodio. Los dos se consiguen fácil, pero con las recetas siguientes (<Link href="/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-calcio" className="underline text-orange-ink hover:text-orange">carbonato de calcio</Link>, <Link href="/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-sodio" className="underline text-orange-ink hover:text-orange">carbonato de sodio</Link>) podrás hacerlos en casa con materiales que probablemente ya tienes. No son procesos difíciles, solo toman tiempo. Hacerlos por tu cuenta te ayudará a entender qué son y por qué los usamos antes de que aparezcan en las fórmulas de color.</p>
    </ManualLayout>
  )
}
