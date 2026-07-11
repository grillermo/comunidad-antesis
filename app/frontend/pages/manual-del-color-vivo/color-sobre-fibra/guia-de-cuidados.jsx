import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Antes que nada, vale la pena replantear nuestras expectativas sobre la ropa. Ya nos acostumbramos a tener prendas que no cambian de color, pero que tampoco van a desintegrarse en mil años porque están hechas de poliéster, nailon o elastano.</p>
      <p>Por supuesto que la indumentaria debe ser duradera y honesta, pero creo que también necesita ser más amigable con el medio ambiente. Quiero que recuerdes que los colores y materiales naturales no son permanentes: las prendas teñidas naturalmente cambiarán con el tiempo, frecuentemente a una textura interesante, a un color diferente y, lo mejor de todo, terminarán por desintegrarse y volver a la tierra.</p>
      <p>Creo que es muy importante entender profundamente los materiales con los que trabajamos, y reconocer que en la naturaleza, todo requiere muerte y renacimiento. Crear algo requiere fruto y composta. Requiere primavera, verano, otoño e invierno. Requiere el inframundo. Requiere luz y oscuridad. En la naturaleza hay un pulso, hay un ritmo en la respiración de todos los seres: hay una inhalación y una exhalación. En ese proceso es donde está la vida.</p>
      <p>Lo contrario a eso es el estancamiento. Es querer aferrarse a una de esas fases y hacerla eterna; lo vemos muchas veces escondido o disfrazado cuando nos aferramos a la juventud. Es miedo al cambio y obsesión con la perfección. Es querer estar siempre en primavera o en verano, como si todo creciera en línea recta.</p>
      <p>Crear algo teñido con la naturaleza está del otro lado: te enseña a abrazar esa falta de control, a dejarse llevar y crear junto con algo más grande que tu, y confiar en ese ciclo. Cuando un proyecto sale mal, o reconoces que una fibra ya no puede rescatarse, también se te pide abrazar épocas que son desordenadas, donde hay descomposición, donde hay invierno, donde hay vacío. No como efecto secundario, sino como algo necesario, un requisito para que exista la vida. Tener la posibilidad de enterrar aquellas prendas viejas y experimentos fallidos</p>
      <p>nos libera de aquello que habríamos exiliado como oscuro, sombrío, podrido o indeseable, y nos deja reconocerlo como una necesidad, un requisito, una composta que lleva a tierra fértil.</p>
      <p>Aun así, mientras sean útiles debemos cuidarlas. Con las siguientes recomendaciones, es completamente posible que las piezas teñidas te acompañen más tiempo:</p>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Lava a máquina o a mano con agua fría y colores similares.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Utiliza jabón neutro o suave y disuelve con agua antes de aplicarlo a la tela, nunca lo pongas directo.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Tiende a la sombra y evita la exposición de luz solar directa constante.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>No laves en seco.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Si el color cambia mucho o ya no te gusta, tiñe la prenda otra vez. Si ya la mordentaste alguna vez, no necesitas volver a hacerlo y puedes utilizar otro colorante.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Cuando un textil ya no te sirva, considera que si está hecho de fibras 100 % naturales (algodón, lino, lana, cáñamo, seda) y no tiene estampados de plástico, puede compostarse. Córtalo en pedacitos pequeños, retira piezas metálicas e hilos sintéticos y devuélvelo a la tierra. Cerrar el ciclo también es parte del proceso.</li></ul>
    </ManualLayout>
  )
}
