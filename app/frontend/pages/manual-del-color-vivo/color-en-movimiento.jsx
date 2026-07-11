import ManualLayout from '@/components/ManualLayout'
import PartDivider from '@/components/manual/PartDivider'
import divider from '@/assets/manual/divider-color-en-movimiento.jpg'

export default function Page({ title }) {
  return (
    <ManualLayout title={title} hideTitle>
      <PartDivider image={divider} title={title}>
          <p>Aquí empieza la parte más libre del manual. Después de teñir, precipitar y recolectar colores, llega el momento de mezclar los polvos con huevo, cera, goma y aceite y convertirlos en pinturas, crayones, pasteles, gises y tintas. En esta sección trabajaremos con índigo en polvo, pigmentos de laca, azul maya y pigmentos minerales (ya sean pigmentos de la tierra recolectados por mí o comerciales). Los pigmentos se pueden mezclar libremente para obtener las tonalidades deseadas; si buscas tonos pasteles, agrega un poco de dióxido de titanio o arcilla caolín.</p>
          <p>Al final incluyo tres tintas que, aunque no tienen pigmentos en polvo, cuentan con un carácter experimental e histórico importante y sirven muy bien para otros proyectos de arte.</p>
      </PartDivider>
    </ManualLayout>
  )
}
