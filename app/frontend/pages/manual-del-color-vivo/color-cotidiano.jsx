import ManualLayout from '@/components/ManualLayout'
import PartDivider from '@/components/manual/PartDivider'
import divider from '@/assets/manual/divider-color-cotidiano.jpg'

export default function Page({ title }) {
  return (
    <ManualLayout title={title} hideTitle>
      <PartDivider image={divider} title={title}>
          <p>En esta sección te comparto algunas de las ideas y recetas que más disfruto para llevar los tintes naturales a proyectos manuales y a actividades en grupo o con niños.</p>
          <p>Son ideas simples, pensadas para invitarte a explorar los colores de la naturaleza desde otro lugar. Espero que te inspiren a compartir tus creaciones con tu familia y amigos. Cualquiera de estos proyectos puede ser un buen pretexto para una tarde fuera del celular.</p>
      </PartDivider>
    </ManualLayout>
  )
}
