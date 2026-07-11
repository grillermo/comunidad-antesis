import ManualLayout from '@/components/ManualLayout'
import PartDivider from '@/components/manual/PartDivider'
import divider from '@/assets/manual/divider-color-sobre-fibra.jpg'

export default function Page({ title }) {
  return (
    <ManualLayout title={title} hideTitle>
      <PartDivider image={divider} title={title}>
          <p>Cada fibra tiene memoria. Antes de recibir el color, conviene saber de qué está hecha: de qué planta viene o qué animal la entregó y cómo está hilada o tejida. Teñir con tintes naturales es un proceso vivo, dinámico, a veces impredecible. Si te resulta intimidante, empieza por un proyecto pequeño: una camiseta, un pañuelo o una funda de almohada que ya tengas en casa.</p>
          <p>Gran parte de esta práctica consiste en volver a mirar lo que ya existe. Una prenda que se manchó, algo que ya no te pones, sábanas viejas: todo eso puede renacer en una olla de tinte. No necesitas comprar nada nuevo para empezar.</p>
      </PartDivider>
    </ManualLayout>
  )
}
