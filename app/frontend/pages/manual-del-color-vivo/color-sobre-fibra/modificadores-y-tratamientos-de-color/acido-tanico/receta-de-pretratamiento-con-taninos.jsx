import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Este es el primer baño en el que sumergimos textiles de fibras vegetales cuando quieres profundizar sus colores. Se usan en un paso preliminar al mordentado y al teñido. Funcionan como una preparación del textil que mejora su afinidad con el mordiente, dando como resultado colores más profundos, más uniformes, más duraderos y más resistentes a la luz. Se utilizan principalmente en fibras celulósicas como el: lino, algodón y lyocell. Debido al tiempo y al agua extra que requiere el proceso, yo solo los uso en textiles que serán lavados muchas veces o en proyectos comerciales. Te recomiendo hacer algunas pruebas y decidir si te gusta el resultado, ya que los colores se ven distintos, con un tono beige o crema en el fondo y el proceso toma bastante más tiempo.</p>
      <Recipe rendimiento={""} tiempo={"2 horas 15 minutos aproximadamente, 15 minutos activos. Si trabajas en frío, el reposo se extiende a 12 horas, por lo que conviene dejar el textil remojando durante la noche. Lo ideal es aplicar los del mordentado, ya que el textil debe pasar directamente del baño de taninos al de mordiente sin secarse, para que los taninos no se pierdan."}>
        <Steps>
          <li>Prepara una olla con agua caliente a 40 grados centígrados. La cantidad de agua es importante: usa aproximadamente una proporción de 1:30 (textil:agua) según el peso de la fibra en seco.</li>
          <li>Agrega 8% y 10% del peso de la fibra en ácido tánico puro, o entre 20% y 30% si usas otro material vegetal pulverizado alto en taninos (agallas de roble, mirobálano, cáscaras de grataninos el mismo día nada), y mezcla bien.</li>
          <li>Introduce el textil previamente lavado, muévelo ocasionalmente y déjalo remojar por 2 horas. No es necesario ponerlo a calentar nuevamente.</li>
          <li>Utiliza guantes para sacar el textil del agua. Puedes centrifugarlo en la lavadora o exprimirlo manualmente, pero no lo enjuagues.</li>
          <li>Mordenta el textil inmediatamente con tu elección de sal de aluminio y prosigue a teñir como desees.</li>
          <li>Puedes reutilizar el agua de taninos varias veces, pero agrega más agua y material vegetal según sea necesario.</li>
        </Steps>
        <SideNote>La aplicación de taninos puede hacerse con agua fría en caso de que el textil lo demande, pero necesitarás dejarlo preferiblemente por 12 horas. Yo solo utilizo esta receta para fibras de celulosa. No me parece necesaria para seda y lana, además tienden a apagar u oscurecer los colores en este tipo de fibras proteicas, pero siéntete libre de experimentar para obtener variedad de colores y recetas.</SideNote>
      </Recipe>
    </ManualLayout>
  )
}
