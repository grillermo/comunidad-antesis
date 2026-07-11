import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El ácido cítrico es un compuesto orgánico presente en las frutas cítricas como el limón. Se utiliza para modificar el color en tintes sensibles al pH como la grana cochinilla y el palo de Brasil, convirtiendo rojos y fucsias en naranjas y corales luminosos. Funciona únicamente en fibras de proteína, ya que este ácido daña la celulosa y consume parte del mordiente con aluminio. Puedes usar ácido cítrico en polvo comprado en droguerías, o jugo de limón recién exprimido.</p>
    </ManualLayout>
  )
}
