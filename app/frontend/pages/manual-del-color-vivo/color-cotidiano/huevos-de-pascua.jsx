import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Teñir huevos para Pascua con colorantes naturales es una forma sencilla de explorar el color. Todos los colorantes que usamos para teñir tela funcionan para este proyecto. Aquí, además, no hace falta preocuparse por la fijación del color, así que, si lo deseas puedes explorar otros colorantes comestibles que en tela no se fijan bien, como col morada o flor de Jamaica. También puedes usar cúrcuma, cáscaras de cebolla, o cualquier otra planta que suelte color en agua.</p>
      <p>Yo prefiero vaciar primero los huevos con ayuda de una jeringa y teñir solo los cascarones. Los voy recolectando durante semanas. Después de teñirlos, los puedo guardar, colgar o reutilizar como decoración sin preocuparme que se echen a perder.</p>
      <Recipe rendimiento={""} tiempo={""}>
        <Steps>
          <li>Coloca media taza de material vegetal en una olla con 2 tazas de agua.</li>
          <li>Hierve durante unos 20 a 30 minutos para extraer bien el color.</li>
          <li>Cuela el material vegetal.</li>
          <li>Lava los cascarones con agua y jabón.</li>
          <li>Hierve los cascarones en agua por 10 minutos, enjuaga y escurre el agua.</li>
          <li>Coloca los cascarones en el tinte. Puedes mezclar varios tintes para obtener más colores.</li>
          <li>Déjalos reposar toda la noche dentro del tinte.</li>
          <li>Sácalos y déjalos secar.</li>
          <li>Si quieres puedes hacer estampados con hojas o flores directamente sobre el huevo: envuélvelo con un pedazo de media o pantimedia y haz un nudo con una liga, apretando para que la planta quede bien pegada al cascarón. Sumerge el huevo envuelto en el tinte y ponlo a fuego bajo por 20 minutos. Cuando lo saques y retires la media, aparecerá la silueta clara de la planta.</li>
        </Steps>
      </Recipe>
    </ManualLayout>
  )
}
