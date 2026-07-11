import ManualLayout from '@/components/ManualLayout'
import PartDivider from '@/components/manual/PartDivider'
import divider from '@/assets/manual/divider-pigmento-y-polvo.jpg'

export default function Page({ title }) {
  return (
    <ManualLayout title={title} hideTitle>
      <PartDivider image={divider} title={title}>
          <p>Como pudiste darte cuenta, el libro abarca mucha más información sobre el teñido, pues llevo más de una década experimentando con él. Hace seis o siete años, intentando aprovechar los tintes que me sobraban después de teñir, aprendí que podían convertirse en polvo, en pigmento, y me enganché. Pasé meses perfeccionando la técnica, coleccionando pigmentos y mezclándolos entre sí para descubrir nuevos tonos. Aprendí también a transformar el polvo de índigo en azul maya para obtener un turquesa más vivo, y empecé a recolectar tierras de distintos lugares para prepararlas y usarlas en acuarela y crayones. Ha sido uno de los caminos más emocionantes que me ha dado esta práctica, y me parece un recurso importante, además de divertido.</p>
          <p>En esta sección te enseñaré a preparar todos estos polvos para que en el siguiente capítulo los conviertas en pintura, tinta y otros materiales de arte.</p>
      </PartDivider>
    </ManualLayout>
  )
}
