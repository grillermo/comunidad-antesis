import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Una fibra sucia resulta en un teñido disparejo. Antes de pensar en ponerle color, hay que lavarla muy bien. Las fibras nuevas suelen traer ceras, aprestos, almidones, aceites y restos del proceso industrial que impiden que el tinte se adhiera de manera pareja. Las fibras usadas cargan residuos de jabón, suavizante, sudor y polvo.</p>
      <p>Hay dos procedimientos que yo sigo, dependiendo del textil: lavado simple y descrudado. Si el textil es nuevo o crudo —es decir, nunca ha sido lavado ni tratado después del hilado o tejido— necesitas descrudarlo. Para todo lo demás, basta con un lavado simple.</p>
      <p>Hay algunas consideraciones que aplican a cualquier lavado que debes tomar en cuenta:</p>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange">
        <li>Si vas a lavar hilo o estambre, primero forma una madeja: toma el extremo del hilo y enróllalo en círculos alrededor de tu mano y tu codo, como si formaras un ovillo grande y abierto, hasta terminar el hilo o llegar al tamaño que quieras. Desliza el aro resultante fuera de tu brazo. Átalo en tres o cuatro puntos con un trozo corto de hilo de algodón, pasándolo entre las hebras y haciendo un nudo flojo —lo suficiente para que las hebras no se separen, pero sin apretarlo, para que el agua y el tinte puedan circular libremente entre ellas y la madeja no se marque.</li>
        <li>Pesa el textil en seco y anótalo. Todas las fórmulas se calculan sobre ese peso.</li>
        <li>Usa ollas de acero inoxidable o peltre. El aluminio reacciona con el carbonato y muchos tintes; el cobre y el hierro modifican los colores (eso lo aprovecharemos después, pero aquí no nos conviene).</li>
        <li>Mueve la fibra con cucharas de madera o acero inoxidable.</li>
        <li>Enjuaga siempre con agua a la misma temperatura a la que lavaste. Los choques térmicos encogen la lana y afieltran la seda.</li>
        <li>El carbonato de sodio, también llamado sosa de lavar o soda ash, no es lo mismo que el bicarbonato de sodio. Es más alcalino y sirve para abrir la fibra vegetal y desprender impurezas. Ver sección Preparación de carbonatos.</li>
        <li>El carbonato de sodio y el calor dañan la lana cruda. Para descrudarla sumerge la madeja en agua tibia (no más de 40°C) con jabón neutro diluido, déjala remojar media hora sin moverla (la lana se afieltra con la agitación), y enjuaga con agua a la misma temperatura, cambiando el agua varias veces hasta que salga limpia. Exprime apretando suavemente, nunca retorciendo.</li>
      </ul>
    </ManualLayout>
  )
}
