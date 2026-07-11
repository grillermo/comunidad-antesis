import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Los crayones son barras de cera pigmentada para dibujar. La idea de mezclar cera con pigmento es muy antigua: los egipcios la usaban hace 5000 años para fijar color sobre piedra, y los griegos y romanos desarrollaron técnicas similares. La palabra “crayón” apareció en Francia del siglo XVII, derivada de craie (“tiza”). El crayón moderno como lo conocemos nació en 1903 bajo la marca Crayola, combinando craie con oleaginous (“oleaginoso”) para nombrarlos. A diferencia de los pasteles al óleo, los crayones contienen más cera y menos aceite, lo que les da un trazo más firme y definido, ideal para líneas precisas y un uso resistente. Son fáciles de usar, durables e ideales para pintar con niños.</p>
      <Recipe rendimiento={"8 a 12 crayones medianos."} tiempo={"20 minutos aproximadamente, más 1 a 2 horas de enfriado."}>
        <Steps>
          <li>Derrite a baño maría 20 gramos de cera de soya, 20 gramos de cera de abeja y 20 gramos de cera de carnauba en una olla pequeña. También puedes usar un calentador de cera.</li>
          <li>Cuando las ceras estén completamente derretidas, agrega 20 gramos de pigmento previamente molido y cernido.</li>
          <li>Si quieres un color más opaco o pastel, agrega un gramo de dióxido de titanio.</li>
          <li>Agrega más pigmento o dióxido de titanio para ajustar el tono deseado.</li>
          <li>Cuando todo esté completamente integrado, vierte la mezcla en moldes de silicona.</li>
          <li>Deja enfriar completamente antes de desmoldar.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
