import ManualLayout from '@/components/ManualLayout'
import { MaterialList, Material } from '@/components/manual/MaterialList'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <MaterialList>
        <Material term="Espátulas de arte">Las puedes conseguir en tiendas de arte.</Material>
        <Material term="Moleta">Es una piedra o vidrio grueso con una base plana que se usa para moler pigmentos; la puedes conseguir en tiendas de arte o usar un mortero de vidrio.</Material>
        <Material term="Base de vidrio o plato amplio de cerámica" />
        <Material term="Miel de abeja" />
        <Material term="Glicerina">La puedes conseguir en farmacias y droguerías.</Material>
        <Material term="Goma arábiga">La puedes conseguir en tiendas de arte y repostería.</Material>
        <Material term="Goma guar">La puedes conseguir en tiendas de arte y repostería.</Material>
        <Material term="Aceite esencial de clavo o cualquier otro aceite antifúngico como el de gaulteria, salvia, orégano o tomillo">Los puedes conseguir en tiendas naturistas y de arte.</Material>
        <Material term="Huevo" />
        <Material term="Aceite de linaza">Lo puedes conseguir en tiendas de arte.</Material>
        <Material term="Vinagre blanco" />
        <Material term="Alcohol etílico o de caña" />
        <Material term="Dióxido de titanio">Sirve para opacar y aclarar el color. Lo puedes conseguir en tiendas de arte.</Material>
        <Material term="Cera de soya">La puedes comprar en droguerías.</Material>
        <Material term="Cera carnauba">La puedes comprar en droguerías.</Material>
        <Material term="Cera de abeja">La puedes comprar en droguerías y tiendas naturistas.</Material>
      </MaterialList>
    </ManualLayout>
  )
}
