import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Para ropa comercial, ya sea nueva o usada, estambre o hilo comercial que no esté crudo, suéteres de cualquier material, seda, lyocell, telas con mezclas de lana, prendas de fieltro y cualquier otro textil que no puedas hervir.</p>
      <Recipe rendimiento={""} tiempo={"45 minutos aproximadamente, de los cuales 30 son de remojo sin supervisión."}>
        <Steps>
          <li>Coloca el textil en agua tibia, aproximadamente 30°C.</li>
          <li>Por cada kilo de ropa seca, agrega 10 gramos de jabón neutro previamente diluido en agua.</li>
          <li>Agrega ¼ de taza de vinagre blanco por cada kilo de ropa seca. (Ayuda a neutralizar residuos del jabón y equilibrar el pH de la fibra antes del mordentado.)</li>
          <li>Deja remojar al menos media hora, moviendo suavemente con las manos.</li>
          <li>Enjuaga bien.</li>
          <li>Puedes ponerlo a secar para usarlo después, o empezar a teñir de inmediato. La fibra mojada absorbe mejor el tinte.</li>
        </Steps>
        <SideNote>Si prefieres, puedes hacer todo este lavado en la lavadora, excepto las prendas delicadas, hilos y estambres, que conviene trabajar a mano para que no se enreden ni se dañen.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
