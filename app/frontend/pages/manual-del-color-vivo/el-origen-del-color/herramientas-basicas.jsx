import ManualLayout from '@/components/ManualLayout'
import { MaterialList, Material } from '@/components/manual/MaterialList'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <MaterialList>
        <Material term="Una estufa o fuente de calor para hervir agua">Puedes usar la estufa de tu cocina.</Material>
        <Material term="Ollas y cacerolas con tapa. Yo prefiero las de acero inoxidable o esmaltadas.">Puedes usar cualquier material, solo ten en cuenta que el cobre y el aluminio modifican el color del tinte. Más adelante puede ser algo que busques, pero al empezar conviene que nada altere los resultados.</Material>
        <Material term="Bascula">Puedes usar la de tu cocina, yo prefiero que sea digital porque es más exacta.</Material>
        <Material term="Utensilios para mezclar y manipular">Pueden ser cucharas, palas, pinzas. Funcionan mejor los de acero inoxidable o madera.</Material>
        <Material term="Recipientes y cubetas de diferentes tamaños." />
        <Material term="Mortero y pistilo de cerámica o piedra." />
        <Material term="Termómetro de cocina">Es especialmente útil si trabajas con lana, seda o lyocell.</Material>
      </MaterialList>
    </ManualLayout>
  )
}
