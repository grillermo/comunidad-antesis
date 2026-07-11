import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Los pasteles son pigmentos en barra con poco aglutinante. Aunque Leonardo da Vinci experimentó con ellos en el Renacimiento, fue en el siglo XVIII cuando se consolidaron como medio artístico, gracias a la pintora veneciana Rosalba Carriera, que los usó para retratar a la aristocracia europea y demostró que podían rivalizar con el óleo en intensidad y detalle. En el siglo XIX, Edgar Degas y otros impresionistas los llevaron aún más lejos, haciéndolos protagonistas de obras finales y no solo bocetos. Ofrecen colores intensos y textura aterciopelada, ideales para retratos, paisajes y dibujo libre. Hay dos tipos principales: pastel suave y pastel al óleo.</p>
    </ManualLayout>
  )
}
