import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Este modificador se agrega directamente al tinte caliente, durante el teñido. Es especialmente útil cuando los rojos salen anaranjados o los amarillos salen apagados. Funciona mejor en aguas blandas; si tu agua es dura (con mucha cal), el efecto será menos notable.</p>
      <Recipe rendimiento={""} tiempo={"1 hora 20 minutos aproximadamente, 15 minutos activos."}>
        <Steps>
          <li>Para modificar el color del tinte, agrega del 1% al 5% del peso de la fibra que quieras teñir en carbonato de calcio al tinte caliente.</li>
          <li>Revuelve bien e introduce la fibra previamente lavada y mordentada.</li>
          <li>Calienta a fuego bajo durante una hora, moviéndolo con frecuencia para que el color sea uniforme.</li>
          <li>Apaga el fuego, espera a que se enfríe un poco y enjuaga solo con agua. Puedes usar la lavadora.</li>
          <li>Exprime y tiende a la sombra.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
