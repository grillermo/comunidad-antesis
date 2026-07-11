import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>La antotipia es una técnica fotográfica desarrollada en 1842 por Sir John Herschel, el mismo astrónomo y químico que un año antes había inventado la cianotipia. A diferencia de esta última, que usa sales de hierro para producir imágenes azul Prusia, la antotipia usa pigmentos botánicos como sustancia sensible a la luz: el sol decolora las áreas expuestas y conserva el color en las áreas cubiertas, produciendo una imagen positiva en tonos del color original del pigmento. Es una técnica lenta, sutil y profundamente botánica: cada planta da un tono distinto, cada exposición depende del clima y cada imagen es irrepetible.</p>
      <p>La cúrcuma es uno de los pigmentos clásicos para esta técnica por su intenso color amarillo y su sensibilidad a la luz. También puedes experimentar con betabel, espinaca, té negro o cualquier extracto vegetal con buen color y alta sensibilidad a la luz.</p>
      <Recipe rendimiento={""} tiempo={"12 horas en total, 15 minutos de preparación activa, más varias horas a varios días de exposición al sol, dependiendo de la intensidad de luz."}>
        <Steps>
          <li>Prepara la Tinta a base de alcohol de la sección anterior.</li>
          <li>Con un pincel suave, aplica la tinta sobre papel acuarela o papel artesanal, en capas finas y uniformes. Deja secar completamente entre ellas. Aplica la tinta al menos dos o tres veces para que el color quede saturado.</li>
          <li>Una vez seco, guarda el papel en un lugar oscuro hasta el momento de usarlo.</li>
          <li>Sobre el papel pintado coloca objetos planos: hojas, flores, encajes, plantillas recortadas. Cualquier cosa que bloquee la luz creará una silueta.</li>
          <li>Cubre con un vidrio o acrílico transparente para mantener todo en su lugar y expón al sol directo.</li>
          <li>Revisa cada hora. Cuando el área expuesta haya perdido suficiente color y la silueta sea visible, retira los objetos. Dependiendo del sol, esto puede tomar de unas horas a varios días.</li>
          <li>Si usas cúrcuma, puedes sumergir el papel en una solución de 250 ml de agua con 15 gramos de bicarbonato de sodio para intensificar el contraste y revelar tonos marrones y rojos.</li>
          <li>Guarda el papel revelado en un lugar oscuro, ya que la imagen seguirá siendo sensible a la luz y decolorándose con el tiempo.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
