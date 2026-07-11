import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El pretratamiento con soya es opcional y, honestamente, considero que requiere demasiado tiempo, así que solo utilizo este método para proyectos artesanales a base de celulosa: lino, algodón, lyocell. Te recomiendo hacer pruebas antes de hacer una producción grande y, una vez termines, comparar para ver si consideras que vale la pena el tiempo y el esfuerzo. Los colores suelen ser más profundos y saturados, pero también más apagados en luminosidad: algunos ganan cuerpo, otros pierden brillo.</p>
      <Recipe rendimiento={""} tiempo={"de 1 a 4 semanas en total, 30 minutos de trabajo activo; el resto es remojo y"}>
        <Steps>
          <li>Lava o descruda.</li>
          <li>En una olla o cubeta, coloca una parte de leche de soya por 5 de agua, calcula que sea suficurado. ciente para que el textil a tratar quede completamente cubierto.</li>
          <li>Introduce el textil en leche de soya, muévelo ocasionalmente y déjalo remojando por 12 horas.</li>
          <li>Saca el textil de la leche y exprime bien.</li>
          <li>Tiéndelo a la sombra.</li>
          <li>Una vez que esté completamente seco, necesitas dejarlo curar: guárdalo en un lugar fresco, seco y oscuro de 1 a 4 semanas.</li>
          <li>Después de curarlo, mordenta el textil con la sal de aluminio de tu elección y procede a teñirlo.</li>
        </Steps>
        <SideNote>Puedes reutilizar la leche de soya varias veces, pero deberás desecharla si empieza a cuajarse.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
