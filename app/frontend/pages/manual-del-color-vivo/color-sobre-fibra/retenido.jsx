import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Para obtener variedades de color sin modificadores químicos, se utiliza una técnica conocida como reteñido, la cual consiste en teñir una fibra varias veces, encimando los colores para obtener diferentes tonalidades y gamas. Un ejemplo sería teñir un textil con gualda y después teñirlo con índigo para obtener verde, o teñir un algodón primero con grana cochinilla y luego con cáscara de cebolla encima para obtener un ladrillo intenso.</p>
      <p>Lo interesante de esta técnica es que el orden del teñido da colores diferentes. Los resultados son mucho más estables, más controlados y también mucho más fáciles de replicar que los colores obtenidos de agregar diferentes colorantes a un mismo tinte.</p>
      <p>El reteñido es especialmente útil cuando queremos incorporar tonos azulados con índigo, pero también funciona muy bien para intensificar otros colores: por ejemplo, un algodón teñido primero con rubia y luego con grana cochinilla produce un rojo mucho más profundo que cualquiera de los dos por separado.</p>
      <p>Lo que debes tomar en cuenta al reteñir es lo siguiente:</p>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Solo necesitas mordentar una vez si vas a teñir con tintes que necesitan mordientes de aluminio, pero es mejor que no permitas que la fibra se seque entre baño y baño. Los pasos serían: lavar o descrudar el textil, mordentar, teñir, enjuagar solo con agua, mantenerlo mojado o húmedo, teñir con otro color encima, enjuagar una vez más y dejar secar. Si después de que la fibra se haya secado quieres añadir más colores, solo asegúrate de mojarla muy bien con agua tibia antes de introducirla al tinte, para que el color quede parejo.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Como he mencionado con anterioridad, el índigo no necesita mordentado con aluminio para que el color se fije. Así que, si quieres teñir con índigo después de algún color, puedes hacerlo inmediatamente después de enjuagarlo o dejarlo secar y luego teñirlo. Si quieres teñir primero con índigo y luego pasarlo a un tinte de extracción con calor los pasos serían: lavar o descrudar el textil, teñir con índigo, enjuagar solo con agua, mordentar con aluminio, teñir el segundo color encima, enjuagar una vez más y dejar secar.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Reusar los tintes en un segundo baño para reteñir es bastante útil. Puedes refrigerarlos para evitar que les crezca moho. Considera que entre más veces los reutilices, más claros serán los colores que obtendrás. Esos tonos más suaves son ideales para experimentar.</li></ul>
      <p>Te comparto algunas combinaciones para empezar (no es una ciencia exacta, retira la fibra del último baño cuando veas el tono que quieres):</p>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Cempasúchil + índigo = verde militar</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Gualda + índigo = verde espárrago</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Índigo + cáscara de granada = verde menta</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Cáscara de granada + grana cochinilla = durazno</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Grana cochinilla + cáscara de cebolla = ladrillo</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Índigo + grana cochinilla = órcela</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Rubia + grana cochinilla = carmín</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Grana cochinilla + palo de Campeche = berenjena</li></ul>
      <p>Un recurso que me ayudó mucho a entender las gamas de colores al encimarse durante el reteñido fue el libro Interacción del color de Josef Albers. Normalmente estamos acostumbrados a mezclar colores en pintura y agregar más o menos cantidades para obtener diferentes gamas cromáticas. En tintes naturales, eso no funciona: necesitas imaginar los colores atravesándose. Si esta técnica te interesa, ese libro contiene varios ejercicios interesantes que cambian la forma de ver el color.</p>
    </ManualLayout>
  )
}
