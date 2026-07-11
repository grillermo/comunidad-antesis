import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>La leche de soya no es propiamente un mordiente, sino un aglutinante y sellador a base de proteína. Sus propiedades pueden ayudarte a que las fibras de celulosa se comporten como si fueran de proteína, lo que resulta en colores más intensos.</p>
      <p>Algunas personas utilizan leche de soya como único mordiente, pero yo prefiero hacer un pretratamiento similar al que hago con taninos y después mordentar con aluminio para crear un verdadero enlace químico que fije el color. Adicionalmente, utilizo leche de soya como un adhesivo natural en algunas recetas a lo largo del manual.</p>
    </ManualLayout>
  )
}
