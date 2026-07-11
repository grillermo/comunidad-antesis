import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Esta receta es para hacer telas de algodón impregnadas con cera que se utilizan como alternativa reutilizable al plástico adherente en la cocina. Funcionan para cubrir bowls y platos, envolver frutas, verduras, pan, queso y transportar alimentos sólidos. Son reutilizables durante meses, lavables con agua fría y biodegradables al final de su vida útil.</p>
      <p>Puedes usar cualquier tela de algodón para esta técnica. Podrías teñirla con el tinte natural y la técnica de tu preferencia, lo único que debes de considerar es lavar bien la tela con jabón antes de cubrirla con cera.</p>
      <p>Quiero aprovechar para compartir otra técnica para crear motivos en la tela utilizando varios de los conocimientos en este manual: un mordentado parcial con un aglutinante de alumbre que crea contrastes intensos en un solo tinte. El procedimiento consiste en realizar una extracción normal, pero antes de introducir la tela en el tinte, se dibujan motivos con el aglutinante y se deja secar. Las áreas de la tela pintadas con esta mezcla quedarán mordentadas y donde aplicaste el alumbre el color saldrá más intenso.</p>
      <p>Algunos de los colorantes que funcionan particularmente bien para este proyecto son: cáscara de cebolla, cáscara de aguacate, cúrcuma, palo de Brasil, palo de Campeche, grana cochinilla y cáscara de nogal negro.</p>
      <Recipe tiempo="2 días aproximadamente. 3 horas de trabajo activo.">
        <Steps>
          <li>Lava o descruda tela 100% de algodón. Para este proyecto, a mí me gusta usar popelina o manta.</li>
          <li>Extrae un tinte en una olla del colorante natural de tu preferencia, calculando el peso de la tela y agregando suficiente agua para que se mueva libremente.</li>
          <li>Mientras tanto, planea el diseño de tu estampado o dibujo: corta la tela en los tamaños que desees, a mí me gusta hacer varias medidas para darles diferentes usos.</li>
          <li>Marca el motivo con rotuladores lavables o utiliza una mesa de luz con el dibujo abajo; eso es importante porque vas a pintar con un aglutinante que casi no se ve.</li>
          <li>Disuelve 4 gramos de alumbre o acetato de aluminio en 30 ml de agua caliente. Cuando esté completamente disuelto, espolvorea 1 gramo de goma guar o goma tragacanto y mezcla bien. Deja reposar 15 minutos hasta que tenga una textura parecida al yogurt.</li>
          <li>Marca el dibujo con el aglutinante utilizando un pincel. Si se expande mucho sobre la tela, puedes agregar más goma.</li>
          <li>Déjalo secar completamente.</li>
          <li>Filtra la materia vegetal de la extracción e introduce la tela con cuidado; agrega más agua si no está completamente cubierta de tinte.</li>
          <li>Calienta por al menos 20 minutos a fuego bajo, máximo una hora. Mueve constantemente y revisa el color para no sobrecalentar.</li>
          <li>Espera a que la tela haya enfriado lo suficiente para manipularla. Sácala, exprímela y enjuaga muy bien solo con agua.</li>
          <li>Tiéndela a la sombra y espera hasta que esté completamente seca. Después lava con agua jabonosa y vuelve a dejar secar.</li>
          <li>Ralla 10 gramos de cera de abeja de grado alimenticio y aparta. Si consigues hojuelas o pellets, no necesitas rallarlo.</li>
          <li>Coloca una toalla o tela usada sobre una tabla de planchar; encima coloca papel encerado para hornear y luego la tela limpia y seca. Asegúrate de que el papel sea más grande que la tela para que la cera no se escurra fuera.</li>
          <li>Coloca cera de abeja sobre la tela en pequeños montecitos; no hay una medida exacta. Después de hacer varias pruebas podrás ajustar las cantidades.</li>
          <li>Coloca otro papel encerado encima de la tela, cubriéndola.</li>
          <li>Plancha a temperatura máxima. Con el calor, la cera se expandirá y cubrirá la tela. Agrega más cera si es necesario hasta que quede completamente impregnada.</li>
          <li>Retira el papel y permite que la tela se enfríe completamente.</li>
          <li>Corta las orillas con una tijera de zigzag para evitar que se deshilachen.</li>
        </Steps>
      </Recipe>
    </ManualLayout>
  )
}
