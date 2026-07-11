import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Las acuarelas en pastillas fueron inventadas por los hermanos William y Thomas Reeves en Londres en 1780. Antes de eso, los pintores tenían que moler sus propios pigmentos con goma arábiga cada vez que querían pintar; las pastillas vinieron a resolver ese problema porque podían transportarse fácilmente y se activaban con solo mojar el pincel. La adición de miel como humectante fue clave, ya que mantiene las pastillas blandas y permite que el color se libere con facilidad. Este formato facilitó que la acuarela saliera del taller y acompañará a los artistas al aire libre, marcando el inicio de la llamada “edad de oro” de la acuarela inglesa. Permite transparencias y capas ligeras sobre papel, y ha sido muy usada en bocetos, ilustración botánica y pintura de paisaje.</p>
      <Recipe rendimiento={"60 ml de aglutinante, suficiente para preparar entre 10 y 15 pastillas pequeñas, dependiendo del molde."} tiempo={"10 minutos de preparación más 2 horas de reposo. Las pastillas tardan de 24 a 48 horas en secar."}>
        <Steps>
          <li>Muele 20 gramos de goma arábiga hasta que obtengas un polvo fino.</li>
          <li>Diluye en 40 ml de agua caliente.</li>
          <li>Deja reposar dos horas.</li>
          <li>Agrega 5 gramos de miel de abeja (o jarabe de agave para una versión vegana).</li>
          <li>Agrega 15 gramos de glicerina vegetal y mezcla.</li>
          <li>Agrega una gota de aceite esencial de clavo y mezcla.</li>
          <li>Filtra con una gasa de algodón o muselina.</li>
          <li>Embotella y refrigera cuando no la uses.</li>
          <li>Para usarla, coloca un poco de pigmento en polvo en un plato de cerámica o paleta de vidrio.</li>
          <li>Agrega el aglutinante gota a gota y mezcla con una espátula o moleta hasta lograr una textura suave, sin sensación arenosa. Agrega tanto aglutinante como necesites.</li>
          <li>Coloca la mezcla en pastillas de acuarela vacías o moldes pequeños y deja secar de 24 a 48 horas en un lugar ventilado.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
