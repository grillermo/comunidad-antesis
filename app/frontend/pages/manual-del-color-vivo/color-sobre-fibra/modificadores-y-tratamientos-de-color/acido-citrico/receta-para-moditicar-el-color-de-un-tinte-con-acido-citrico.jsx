import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Este modificador se agrega directamente al tinte caliente, mientras tiñes, para empujar el color hacia tonos más cálidos: rojos que se vuelven naranja ladrillo y fucsias que se vuelven coral.</p>
      <Recipe rendimiento={""} tiempo={"1 hora 20 minutos aproximadamente 15 minutos activos."}>
        <Steps>
          <li>Para modificar el color del tinte, agrega hasta 100% del peso de la fibra que quieras teñir en ácido cítrico o jugo de limón al tinte caliente. Si quieres un cambio sutil, puedes empezar con el 20-30% y ajustar hasta llegar al tono que te guste.</li>
          <li>Revuelve bien e introduce la fibra de proteína previamente lavada y mordentada.</li>
          <li>Calienta a fuego bajo durante una hora moviendo la fibra con frecuencia para que el color sea uniforme.</li>
          <li>Apaga el fuego, espera a que se enfríe un poco y enjuaga solo con agua. Puedes usar la lavadora.</li>
          <li>Exprime y tiende a la sombra.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
