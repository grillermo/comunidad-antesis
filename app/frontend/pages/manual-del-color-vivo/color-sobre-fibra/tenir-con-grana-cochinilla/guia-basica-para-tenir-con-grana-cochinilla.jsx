import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Esta es la receta base para teñir con grana cochinilla. Los modificadores te permiten desplazar el color por todo su espectro, desde los magentas más profundos hasta los anaranjados y los morados. Antes de empezar, asegúrate de que la fibra esté previamente mordentada con aluminio (revisa la guía de mordentado al inicio del capítulo).</p>
      <Recipe rendimiento={""} tiempo={"a 2 horas aproximadamente. Esta receta no requiere reposo nocturno, pero la fibra debe haber previamente."}>
        <Steps>
          <li>5 1. Muele finamente del 3% al 25% del peso de la fibra que quieras teñir en grana cochinilla seca. Dependiendo de la intensidad que busques.</li>
          <li>Agrega la cochinilla molida a una olla con agua y ponla a fuego bajo durante aproximadamensido mordentada te 15 minutos o hasta que alcance unos 60 grados centígrados.</li>
          <li>El color en este punto es magenta, pero puedes agregar un modificador de color, te pongo aquí algunos ejemplos:</li>
          <li>Agrega el modificador de color, si lo deseas, y espera otros 15 minutos a que el color esté integrado.</li>
          <li>Introduce la fibra previamente mordentada, mueve constantemente y mantenla a fuego bajo durante al menos una hora.</li>
          <li>Cuando termines de teñir, espera a que la fibra se enfríe lo suficiente para poder manipularla. No la dejes ahí demasiado tiempo, porque puede mancharse. Después exprime y enjuaga solo con agua. Jamás uses jabón en este paso, pero sí puedes usar la lavadora.</li>
          <li>Tiéndela a la sombra.</li>
        </Steps>
        <SideNote>Modificador Cantidad Color obtenido Fibras Alumbre potásico 20% del peso de la fibra Morado Todas Ácido cítrico 100% del peso de la fibra Anaranjado Lana y seda Cremor tártaro 5% del peso de la fibra Rojo carmín Lana y seda Sulfato ferroso 1% del peso de la fibra Púrpura Todas Ninguno Ninguno Magenta Todas</SideNote>
        <SideNote>Si quieres llevar el color púrpura, ciruela o morados grisáceos, sumerge la fibra ya teñida en un baño con 1 gramo de sulfato ferroso disuelto en agua durante 10 minutos. Enjuaga y tiende. Obtener rojo escarlata en fibras de celulosa con grana cochinilla es posible, pero tradicionalmente se hace con modificadores de estaño y cromo, que son extremadamente tóxicos. La manera respetuosa de obtenerlo es encimando colores. Puedes encontrar esta técnica en el capítulo de Reteñido más adelante. En el caso particular del escarlata o carmín, se obtiene tiñendo primero una base rojiza con rubia y luego tiñendo con grana cochinilla sin modificador encima.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
