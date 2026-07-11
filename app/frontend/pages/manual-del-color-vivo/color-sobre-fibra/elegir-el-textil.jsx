import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Asegúrate de que el textil que elijas sea de al menos 70% de origen natural. Puedes utilizar fibras vegetales como algodón, lino o cáñamo o fibras proteicas como lana o seda. Los materiales artificiales como poliéster, nailon, elastano, viscosa, acetato o rayón no pueden teñirse con tintes naturales, por lo que te recomiendo no usar fibras con porcentajes muy altos.</p>
      <p>Hay una excepción con una fibra de nueva generación a base de pulpa de madera llamada lyocell (conocida también por su marca registrada Tencel). Que sí acepta tintes naturales porque conserva la estructura celulósica de la planta. Es un poco difícil de conseguir en composiciones puras, las etiquetas no están bien reguladas y no aguanta temperaturas altas, por lo que tendrás que mordentar y teñir en frío. Si quieres utilizarla, haz pruebas de teñido y lavado antes de invertir en mucho material.</p>
      <p>Ten cuidado con las fibras etiquetadas como bambú y cáñamo. Aunque provienen de plantas, la producción industrial de la mayoría de las telas y prendas comerciales de estos materiales suele involucrar procesos químicos intensos (disolución con sosa cáustica y sulfuro de carbono) que lo transforman en viscosa o rayón. Aunque la fuente es natural y la planta es sostenible, el proceso químico hace que dejen de ser 100% naturales y, por ende, no se puedan teñir con la misma receptividad que una fibra celulósica sin procesar. Asegúrate de que el material sea cáñamo natural (un tejido firme y de textura rústica, útil para tapicería y ropa de trabajo) o lyocell de cáñamo o bambú.</p>
      <p>También pon atención a elementos de la ropa que a veces pasan desapercibidos: costuras con hilo de poliéster, entretelas sintéticas en cuellos y cinturillas, estampados plásticos, encajes elásticos. Todo eso resistirá el tinte y quedará visible al final del proceso. No es un error, puede incluso ser bonito en ciertos proyectos, pero tómalo en cuenta antes de meter la prenda en la olla.</p>
      <p>Si no sabes de qué material está hecho el textil que quieres teñir, puedes hacer una pequeña prueba quemando unas pocas hebras. Hazla sobre un plato de cerámica o en el lavabo, en un lugar ventilado, y con las hebras sostenidas por unas pinzas metálicas.</p>
      <p>Si al consumirse dejan un residuo plástico —duro, brillante y pegajoso—, no podrás usarlo para teñir. Si, al consumirse huele a papel quemado, se quema lentamente o deja cenizas suaves y polvorientas, significa que es de material orgánico y puedes teñirlo naturalmente.</p>
      <p>El siguiente paso es anotar las características del textil con el que vas a trabajar y pesarlo en seco. El peso total de la fibra es una referencia que utilizamos constantemente para calcular la cantidad de jabón, fijadores y tintes necesarios. Mi práctica está acompañada de bitácoras con registros y muestras donde anoto todo lo que pueda para replicar fórmulas y procedimientos. Te recomiendo que siempre tengas a la mano una libreta, un lápiz y una calculadora.</p>
      <p>Así empieza cada proyecto en mi bitácora:</p>
      <p>Textil Material Base Peso total</p>
      <p>Camiseta Algodón 100% Vegetal 200 g</p>
      <p>Estambre Lana 100% Proteína 120 g</p>
      <p>Tela Lino 80% Vegetal 300 g Poliéster 20%</p>
      <p>Pañuelo Seda 100% Proteína 50 g</p>
      <p>Vestido Lyocell de Vegetal 250 g bambú 100%</p>
      <p>Funda de Cáñamo 100% Vegetal 400 g almohada</p>
      <p>Suéter Lana 70% Proteína 300 g Algodón 30% y vegetal</p>
      <Callout><p>cada fibra reacciona distinto con el calor. La lana y la seda no toleran más de 80-85°C, si hierven, se dañan y pierden brillo. El algodón, el lino y el cáñamo aguantan hasta el hervor. El lyocell aguanta hasta 60°C, pero prefiero trabajarlo en frío junto con los suéteres de cualquier material: el calor, sumado a la agitación y a los cambios bruscos de temperatura los encoge y los deforma con mucha facilidad. Ajusta la flama y la técnica según la fibra con la que trabajes.</p></Callout>
    </ManualLayout>
  )
}
