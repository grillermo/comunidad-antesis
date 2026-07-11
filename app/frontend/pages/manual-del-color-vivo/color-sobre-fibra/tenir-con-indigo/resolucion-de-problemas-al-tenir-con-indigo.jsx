import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>El índigo es un tinte vivo. Reacciona al clima, a la temperatura del agua, a la mineralidad del lugar donde vives, incluso al tipo de cal que conseguiste. No te frustres si tu primer baño no se ve como esperabas, cada tina te enseñará algo. Estos son los problemas más comunes y sus soluciones:</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>El baño es azul intenso, sin espuma cobriza ni reflejo verdoso: el tinte está oxidado. Significa que perdió su capacidad de reducción y necesita reactivarse. Calienta suavemente sin hervir, agrega una cucharada de fructosa (o de sulfato ferroso, según tu fórmula), revuelve con cuidado para no incorporar aire y espera entre 15 y 30 minutos. Si sigue azul, agrega una cucharada de cal, vuelve a esperar. Repite hasta que el líquido recupere su tono amarillo verdoso característico.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>La fibra sale verde y no se vuelve azul al airearse: el baño está demasiado reducido o demasiado alcalino. Déjalo reposar destapado por unas horas para que tome aire, y vuelve a probar. Si</li></ul>
      <p>persiste, agrega un poco de agua con vinagre (una cucharada por litro) hasta equilibrar.</p>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>La fibra sale con manchas o tonos disparejos: casi siempre es porque la tela no estaba bien mojada antes de sumergirla, o porque la moviste mucho dentro del baño e introdujiste burbujas de aire. Asegúrate de que la fibra esté completamente empapada en agua tibia antes de cada inmersión, y muévela con suavidad bajo la superficie del líquido.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>El color se va al lavar: el índigo necesita oxidarse bien antes del enjuague final, si la fibra todavía estaba verdosa cuando la enjuagaste, parte del tinte no alcanzó a fijarse. La próxima vez, deja airear cada inmersión al menos 5 minutos y espera a que la fibra esté completamente azul antes de pasarla al baño de vinagre.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>El baño huele muy mal o tiene moho en la superficie: un tinte de índigo huele a tierra húmeda, a fermento, incluso un poco fuerte; eso es normal. Pero si el olor es claramente pútrido o aparecen manchas oscuras flotando, algo se contaminó. Filtra el líquido, descarta el sedimento y empieza un baño nuevo. La cal suele inhibir el moho, así que si aparece, probablemente faltaba alcalinidad.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>El polvo de índigo no se disuelve y forma grumos: el índigo no estuvo lo suficientemente fino, o el agua estaba demasiado fría. Saca los grumos, vuelve a molerlos en seco con el mortero hasta pulverizarlos, agrega agua hirviendo poco a poco mientras mezclas, e incorpora la pasta resultante al baño.</li></ul>
      <p>Cuando algo sale mal con el índigo, casi siempre se trata de encontrar el equilibrio: ajusta la alcalinidad y la temperatura, observa los cambios, ten paciencia. Tómate tu tiempo para diagnosticar el tinte antes de deshacerte de él. Casi siempre tiene más potencial de lo que parece.</p>
    </ManualLayout>
  )
}
