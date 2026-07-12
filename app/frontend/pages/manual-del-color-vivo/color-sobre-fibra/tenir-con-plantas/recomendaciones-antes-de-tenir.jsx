import { Link } from '@inertiajs/react'
import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange">
        <li>Identifica bien la planta. Si vas a recolectar flores y plantas de la naturaleza, asegúrate de podarlas y manipularlas correctamente y de que no tengan propiedades tóxicas. Para identificar plantas correctas, yo utilizo la búsqueda inversa de imágenes de Google (Google Lens). Se realiza fácilmente subiendo una imagen en el ícono de la cámara en images.google.com.</li>
        <li>Consulta el <Link href="/manual-del-color-vivo/atlas-del-color" className="underline text-orange-ink hover:text-orange">Atlas del color</Link> al final del manual. Ahí encontrarás una selección de plantas tintóreas, que parte de cada una usar y qué color obtendrás.</li>
        <li>Prepara el material según su tipo. Los materiales duros (troncos, cortezas, raíces y semillas) se remojan en agua por al menos 10 horas antes de hervir. Las hojas, pétalos, y cáscaras conviene filtrarlas antes de introducir la fibra, para que no dejen manchas.</li>
      </ul>
    </ManualLayout>
  )
}
