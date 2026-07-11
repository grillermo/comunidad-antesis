import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Esta es la receta básica (muy básica) que utilizo para hacer velas. Como podrás adivinar, no soy muy fan de las parafinas ni de las fragancias artificiales, así que solo utilizo cera de soya, cera de abeja y aceites esenciales de grado terapéutico. Puedes agregar color con pigmentos de laca, pigmentos minerales, azul maya o índigo, así como material vegetal seco como hojas y flores en las orillas del molde. Yo utilizo moldes de silicón o frascos de vidrio y mechas de cualquier tipo (cuerda de algodón sumergida en cera, pabilos comerciales con base de metal o pabilos de madera)</p>
      <Recipe rendimiento={""} tiempo={"45 minutos de preparación más 24 horas de reposo."}>
        <Steps>
          <li>Derrite 1 taza de cera de soya o cera de abeja blanca a baño maría. A mí me gusta usar media taza de cada cera, pero en realidad no necesitas usar ambas.</li>
          <li>Cuando esté completamente líquida, agrega una cucharada de pigmento bien molido. Puedes agregar más hasta que te guste el color. Incorpora bien.</li>
          <li>Agrega 10 gotas del aceite esencial de tu preferencia (opcional).</li>
          <li>Usa un poco de cera derretida para fijar las mechas en los moldes de silicón o en los frascos de vidrio.</li>
          <li>Si lo deseas, puedes usar un poco de cera derretida para pegar flores u otro material vegetal en los bordes de los frascos o moldes.</li>
          <li>Aplica calor en los frascos o moldes por un par de minutos con una secadora de pelo. Esto evita que la cera se enfríe demasiado rápido y se encoja o se agriete.</li>
          <li>Vierte la cera con cuidado sosteniendo las mechas con palitos de madera.</li>
          <li>Las velas tardarán alrededor de 30 minutos en solidificarse por completo, pero te recomiendo dejarlas reposar durante 24 horas.</li>
          <li>Una vez que estén firmes, recorta la parte superior de las mechas a 3 cm aproximadamente.</li>
          <li>Nunca viertas cera por el desagüe. Limpia el recipiente con toallas de papel mientras aún esté caliente y deséchalas en la basura.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
