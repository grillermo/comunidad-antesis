import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Una de las formas más comunes de realizar estampados y motivos con tinta de índigo es a base de doblar, torcer, atar, comprimir o coser el textil para bloquear el tinte y crear patrones geométricos</p>
      <p>o abstractos. Si te interesa profundizar en el tema, te recomiendo investigar técnicas de tie-dye, shibori e ikat.</p>
      <p>Por otro lado, si lo que te interesa es realizar dibujos o patrones, puedes preparar una pasta resistente al tinte, que deja el motivo sin teñir.</p>
      <p>Las pastas de resistencia son tan antiguas como el teñido mismo. En Japón se llaman norizome y se aplican con plantillas de papel encerado, en una tradición conocida como katazome que tiene siglos de historia. En África occidental, sobre todo entre los pueblos yoruba de Nigeria, las mujeres usan pastas a base de almidón para crear los famosos textiles adire, donde el índigo dibuja escenas, símbolos y proverbios completos. Lo que todas estas tradiciones tienen en común es la idea de proteger el color blanco. Es una forma distinta de pensar el dibujo, casi como negativo fotográfico, y tiene algo profundamente satisfactorio cuando la pasta cae y aparece el motivo intacto sobre el fondo azul.</p>
      <Recipe rendimiento={""} tiempo={"24 horas aproximadamente, una hora de trabajo activo."}>
        <Steps>
          <li>Mezcla 20 gramos de harina de soya o frijoles de soya finamente molidos, 100 ml de agua y 20 gramos de cal (hidróxido de calcio).</li>
          <li>Aplica esta pasta a la tela seca (previamente lavada o descrudada) con un pincel.</li>
          <li>Deja secar completamente por al menos 24 hrs.</li>
          <li>Moja la tela en agua tibia.</li>
          <li>Introduce la tela en el baño de índigo; considera que las inmersiones deben ser como máximo de 10 minutos, Repite hasta obtener el tono deseado y sigue los pasos de la guía de índigo.</li>
          <li>La pasta se caerá cuando introduzcas la tela en el enjuague final de agua y vinagre.</li>
          <li>Enjuaga hasta eliminar todos los restos de pasta de resistencia, exprime y tiende a la sombra.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
