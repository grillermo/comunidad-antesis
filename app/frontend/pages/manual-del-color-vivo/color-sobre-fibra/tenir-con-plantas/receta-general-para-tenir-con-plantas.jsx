import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Esta es la receta que uso como base para teñir con cualquier planta. El procedimiento casi siempre es el mismo: extraer el color, filtrar, sumergir la fibra, esperar. Lo que cambia de una planta a otra son los tiempos, las cantidades y algunos pequeños detalles que iremos viendo en las recetas específicas.</p>
      <Recipe tiempo="2.5 a 3.5 horas aproximadamente, 60 minutos activos. Más si el material necesita remojo previo.">
        <Steps>
          <li>Calcula las cantidades. Utiliza 1 gramo de material seco por cada gramo de fibra seca (100% del peso). Si está fresco, usa el doble (200%)</li>
          <li>
            Extrae el color. Calienta el material a fuego bajo por una hora en suficiente agua para que quede cubierto. Algunas excepciones:
            <ul className="mt-3 list-disc space-y-3 pl-6 marker:text-orange">
              <li>Pétalos de flores: déjalos solo media hora y vigila que no hierva, porque el color se esfuma u oscurece con mucho calor.</li>
              <li>Materiales muy duros (como la semilla de aguacate): necesitan al menos hora y media para liberar el color.</li>
            </ul>
          </li>
          <li>Filtra el tinte para retirar los sólidos, dejando solo el líquido coloreado.</li>
          <li>Introduce el textil previamente lavado y mordentado. Asegúrate de que quede completamente cubierto de agua y pueda moverse libremente; agrega más agua si es necesario.</li>
          <li>Calienta el baño a fuego durante treinta minutos a una hora, moviendo constantemente para que el color quede parejo. (Ajusta la temperatura según la fibra.)</li>
          <li>Apaga el fuego y deja que la fibra se enfríe dentro del tinte lo suficiente para poder manipularla, pero no la dejes demasiado tiempo: las partículas del tinte pueden depositarse disparejo y dejar manchas.</li>
          <li>Exprime y enjuaga solo con agua. Jamás uses jabón en este paso. Puedes usar la lavadora</li>
          <li>Tiende a la sombra</li>
        </Steps>
        <SideNote>Puedes macerar todo el material en agua fría desde la noche anterior, o incluso un par de días antes, para optimizar la extracción del color. El procedimiento tarda más, pero los tonos suelen ser más profundos.</SideNote>
        <SideNote>Si lo prefieres, puedes hacer la extracción y el teñido al mismo tiempo, pero entonces necesitas meter el material vegetal en una red fina y remover durante todo el procedimiento para que no queden manchas. Las redes de lavandería para calcetines funcionan muy bien para este truco; busca una de agujeros muy pequeños.</SideNote>
      </Recipe>
      <p>A continuación, encontrarás tres ejemplos básicos de teñido con plantas para que te des una idea y te animes a experimentar.</p>
    </ManualLayout>
  )
}
