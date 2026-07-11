import ManualLayout from '@/components/ManualLayout'
import { MaterialList, Material } from '@/components/manual/MaterialList'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Otra manera de utilizar los tintes para crear dibujos o motivos en la tela es reducir el tinte hasta concentrarlo. Después agrega alumbre para que se fije en la tela, vinagre para que la tinta tenga un pH más ácido y goma guar para que se aplique con más control. La tinta necesita calor con vapor para que el vinagre se evapore y el color se fije por completo. El resultado es bastante bueno para procedimientos artesanales, y funciona bien en algodón, lino y seda.</p>
      <p>Aquí te comparto una receta básica con palo de Campeche, pero puedes sustituir el material tintóreo.</p>
      <MaterialList>
        <Material term="10 g de material vegetal con propiedades tintóreas (palo de Campeche, cáscara de granada, rubia, cochinilla u otro)." />
        <Material term="200 ml de agua." />
        <Material term="2 g de alumbre." />
        <Material term="50 ml de vinagre blanco." />
        <Material term="1 g de goma guar." />
        <Material term="Pincel, sello o pantalla de serigrafía, según la técnica que quieras usar." />
        <Material term="Plancha de ropa con vapor." />
        <Material term="Cubeta o recipiente grande." />
        <Material term="2 recipientes para dividir la tinta." />
        <Material term="Olla pequeña o vaso de precipitado para reducir." />
        <Material term="Colador o tela fina para filtrar." />
        <Material term="Cuchara o varilla para mezclar." />
        <Material term="Tela 100 % natural (algodón, lino o seda), previamente lavada o descrudada." />
        <Material term="5 g de carbonato de calcio por cada litro de agua." />
        <Material term="Frasco de vidrio con tapa hermética para guardar la tinta sobrante." />
      </MaterialList>
      <Recipe tiempo="40 horas aproximadamente, 2 horas de trabajo activo.">
        <Steps>
          <li>Lava o descruda la tela que quieres estampar. Si lo deseas, puedes hacer un baño de taninos para intensificar los colores y volverlos más resistentes a las lavadas o al sol, pero no es absolutamente necesario, especialmente si el colorante que vas a usar contiene taninos.</li>
          <li>Coloca 10 gramos de materia vegetal con propiedades tintóreas —por ejemplo, palo de Campeche— en 200 ml de agua y déjala remojar al menos 12 horas.</li>
          <li>Pon la mezcla a hervir a fuego bajo hasta que se reduzca a aproximadamente 50 ml, alrededor de media hora.</li>
          <li>Retira el material vegetal.</li>
          <li>Divide la tinta en dos recipientes con 25 ml de tinta cada uno.</li>
          <li>En un recipiente, al que llamaremos solución A, disuelve 2 gramos de alumbre. Asegúrate de que esté caliente; si no, no se disolverá.</li>
          <li>Espera a que la tinta del segundo recipiente, que llamaremos solución B, se enfríe; luego agrega 50 ml de vinagre blanco y revuelve bien.</li>
          <li>Agrega la tinta de la solución A al recipiente de la solución B y mezcla bien.</li>
          <li>Agrega 1 gramo de goma guar poco a poco mientras revuelves para evitar grumos. Si quedan grumos, deja reposar 10 minutos y vuelve a mezclar.</li>
          <li>Con esta textura puedes aplicar la tinta sobre tela seca con pincel, sello o pantalla de serigrafía.</li>
          <li>Deja secar el motivo durante al menos 24 horas.</li>
          <li>Aplica calor uniformemente utilizando una plancha de ropa con vapor en su potencia máxima, moviéndola constantemente para que la tela no se queme, durante 10 a 15 minutos en todas las secciones.</li>
          <li>Prepara un baño de carbonato de calcio llenando una cubeta con agua y 5 gramos de carbonato de calcio por cada litro de agua. Calcula que el textil quede completamente cubierto y se mueva libremente.</li>
          <li>Introduce el textil durante 15 minutos y muévelo constantemente.</li>
          <li>Enjuaga en agua tibia para suavizar la tela.</li>
          <li>Tiende a la sombra.</li>
        </Steps>
        <SideNote>Mientras esté bien cerrada, esta tinta dura semanas a temperatura ambiente. Etiqueta el frasco con la planta usada y la fecha.</SideNote>
        <SideNote>La goma guar puede sustituirse por goma xantana o por una pasta hecha con almidón de maíz, aunque la textura cambia. Te recomiendo experimentar con cantidades pequeñas hasta encontrar la viscosidad que más te acomode.</SideNote>
        <SideNote>Si la tinta queda demasiado espesa, dilúyela con unas gotas de vinagre. Si queda demasiado líquida, agrega goma guar de a poco.</SideNote>
        <SideNote>Esta receta funciona como base. Puedes probar con cáscara de granada, rubia, cochinilla o cúrcuma. Cada planta dará una textura y un comportamiento diferente.</SideNote>
      </Recipe>
      <SideNote>El estampado es resistente, pero los tintes naturales se cuidan distinto que los industriales. Lava a mano con agua fría y jabón neutro, sin tallar la zona del dibujo. La primera lavada puede soltar un poco de color, es normal y se estabiliza después. Evita los blanqueadores, el sol directo prolongado y las lavadoras agresivas. Si necesitas planchar, hazlo por el revés.</SideNote>
    </ManualLayout>
  )
}
