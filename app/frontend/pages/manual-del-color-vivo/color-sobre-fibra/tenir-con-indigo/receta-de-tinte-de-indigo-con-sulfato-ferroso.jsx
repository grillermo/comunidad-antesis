import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>A diferencia de la fórmula con fructosa, esta variante usa sulfato ferroso como agente reductor. El proceso es más lento (necesita tres días de reposo en lugar de uno) y solo funciona sobre fibras de celulosa, pero a cambio te ofrece un baño más estable, que requiere menos mantenimiento y que dura varios meses sin perder fuerza. Es la fórmula que prefiero cuando voy a teñir grandes cantidades de algodón o lino a lo largo de varias semanas.</p>
      <Callout><p>Usa mascarilla y lentes de protección al moler el índigo y al incorporar la cal y el sulfato ferroso al tinte. El sulfato ferroso es irritante y debe manipularse con cuidado; evita inhalarlo, no lo ingieras, usa guantes y manténlo lejos del alcance de niños y animales de compañía.</p></Callout>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">Materiales
         •   40 gramos de índigo               •   Fuente de calor</pre>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">•   80 gramos de sulfato ferroso       •   Mortero y pistilo</pre>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">•   120 gramos de cal hidratada        •   Pala de madera</pre>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">•   7 litros de agua                   •   Olla con tapa de al menos
                                                    7 litros de capacidad
         •   Vinagre blanco
                                                •   Tina o recipiente para
         •   Báscula                               enjuagar fibras</pre>
      <p>Procedimiento para preparar el tinte</p>
      <pre className="overflow-x-auto whitespace-pre font-body text-sm leading-6">Tiempo: 3 días         1. Muele el índigo hasta obtener un polvo lo más
      aproximadamente,          fino posible.
      1 hora de trabajo
      activo, más el
      tiempo de teñido,      2. Agrega agua caliente y muele hasta obtener
      que varía con la          una pasta suave libre de grumos.
      intensidad del tono.
                             3. Llena la olla con 2 litros de agua hirviendo.</pre>
      <p>4. Agrega la pasta de índigo y mezcla bien.</p>
      <p>5. Agrega el sulfato ferroso.</p>
      <p>6. Agrega la cal hidratada.</p>
      <p>7. Agrega de 1 a 4 litros de agua hirviendo dependiendo del nivel deseado: entre más agua se agregue, más claro será el color de la primera inmersión. Yo te recomiendo agregar 3 litros de agua para obtener un baño de 5 litros.</p>
      <p>8. Mezcla con cuidado cada 60 minutos durante las siguientes tres horas.</p>
      <p>9. Tapa y deja reposar 3 días en un lugar fresco y seco.</p>
      <p>Procedimiento para teñir</p>
      <p>1. Al tercer día, puedes usar el tinte para teñir. Te recomiendo usar guantes cuando trabajes con él.</p>
      <p>2. Todas las fibras deben estar lavadas previamente y mojarse en agua tibia antes de sumergirse.</p>
      <p>3. Cuando el tinte se haya vuelto de color verde amarillento, hay espuma azul y un poco de espuma cobriza en la parte superior (conocida como flor de índigo), el tinte está listo para teñir.</p>
      <p>4. Sumerge tu madeja, fibra o tela mojada en el tinte y mantenla sumergida durante un periodo de 3 a 15 minutos.</p>
      <p>5. Retira con cuidado la fibra, dejando que el exceso de líquido drene en una cubeta o recipiente que se verterá más tarde en la olla. Comenzarás a ver cómo la fibra cambia de verde oscuro a verde azulado y luego a azul.</p>
      <p>6. Permite que la fibra se vuelva azul después de cada inmersión —sin áreas verdes azuladas o amarillentas— y deja que la fibra se airee durante al menos 5 minutos abriendo las madejas o extendiendo la tela.</p>
      <p>7. Continúa sumergiendo la fibra las veces que quieras hasta que esté dos tonos más oscura de lo que deseas.</p>
      <p>8. Cuando termines de teñir, vierte de regreso a la olla principal todo el exceso de tinte que haya quedado en las fibras y en los recipientes de drenado.</p>
      <p>9. Enjuaga la fibra solo con agua.</p>
      <p>10. Después de enjuagar, remoja la fibra en agua con una taza de vinagre blanco por cada 3 litros de agua durante 20 minutos. Después exprime y coloca la fibra en una olla con agua limpia y ponla a hervir durante media hora.</p>
      <p>11. Exprime y tiende a la sombra.</p>
      <p>Este tinte no necesitará estabilizarse, pero si quieres puedes calentar la olla suavemente a 50 °C cada vez que la utilices para obtener tonos más parejos e intensos.</p>
      <p>La olla se puede rellenar con una solución de base adicional cuando el azul ya no sea tan intenso. Prepara una mezcla nueva de 2 litros en otra olla o recipiente y agrégala al tinte existente. Espera 3 días antes de usarlo.</p>
      <p>Puedes guardar el tinte transfiriéndolo a una cubeta con tapa para que no se evapore. Etiquétalo y considera que, si no lo utilizas ni le agregas más solución de base adicional, caducará en 10 meses.</p>
      <p>Cuando el tinte ya no tiña de azul, modifica su pH agregando de 1 a 2 tazas de vinagre blanco. Vierte el líquido por el desagüe cuando esté frío y tira a la basura el sedimento ya que puede tapar la tubería. Opcionalmente, también puedes poner el tinte al sol, esperar a que se evapore y tirar los restos sólidos a la basura.</p>
    </ManualLayout>
  )
}
