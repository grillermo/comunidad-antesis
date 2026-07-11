import ManualLayout from '@/components/ManualLayout'
import Recipe from '@/components/manual/Recipe'
import Steps from '@/components/manual/Steps'
import SideNote from '@/components/manual/SideNote'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Hacer papel artesanal consiste en remojar restos de papel en agua, triturarlos hasta obtener una pulpa y utilizar un bastidor con malla para formar las hojas. La pulpa se escurre, se transfiere a una tela y se deja secar, dando como resultado un papel único, texturizado y sostenible. A mí me gusta agregar flores o plantas secas y colorearlo con tintes naturales.</p>
      <p>Puedes comprar el bastidor en internet o hacer una versión simple con un marco de madera (sirve un bastidor de pintura o un marco viejo de fotos) y tela de mosquitero engrapada o sujetada por las orillas. El tamaño del marco determina el tamaño de tu papel.</p>
      <Recipe rendimiento={""} tiempo={"1 hora de trabajo activo, más 24 horas de secado."}>
        <Steps>
          <li>Recolecta hojas y trozos de papel limpios pero usados, de esos que terminarían en la basura. No uses nada que tenga cubierta plástica ni papel térmico (el que comúnmente se utiliza en tickets).</li>
          <li>Una vez que hayas recolectado aproximadamente 50 gramos de papel, córtalo o rómpelo en pedazos pequeños de unos 2 por 2 cm y cubrelos con suficiente agua tibia por 20 a 30 minutos.</li>
          <li>Coloca todo en la licuadora (puedes usar la que usar la de tu cocina). Agrega más agua si lo crees necesario y licúa hasta obtener una pulpa suave. Es mejor hacerlo en varias tandas para no forzar el motor.</li>
          <li>Vierte toda la pulpa en aproximadamente 3 litros de agua. Puedes sustituir una parte o toda el agua con un tinte natural previamente filtrado o incluso un tinte usado.</li>
          <li>Sumerge el bastidor y sácalo horizontalmente. En este punto puedes agregar otro material vegetal encima de la pulpa, como pétalos de flores u hojas pequeñas.</li>
          <li>Escúrrelo y voltéalo sobre una tela absorbente que sea lisa y 100% algodón, por ejemplo, franela.</li>
          <li>Presiona suavemente sobre el bastidor con una esponja para transferir la pulpa al algodón y absorber el exceso de agua.</li>
          <li>Deja secar por 24 horas y despega con cuidado.</li>
        </Steps>

      </Recipe>
    </ManualLayout>
  )
}
