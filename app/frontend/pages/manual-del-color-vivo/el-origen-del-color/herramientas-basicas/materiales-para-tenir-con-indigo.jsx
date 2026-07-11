import ManualLayout from '@/components/ManualLayout'
import { MaterialList, Material } from '@/components/manual/MaterialList'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <MaterialList>
        <Material term="Índigo natural para teñir textil">Lo puedes encontrar en forma de pasta, piedra o polvo, es de un color azul marino intenso. El índigo en polvo para teñir cabello no te servirá. Elige el índigo de origen natural y revisa que no esté prerreducido: el hidrosulfito con el que se procesa es tóxico, puede causar irritación severa en los ojos y la piel y es contaminante y perjudicial para los ecosistemas acuáticos.</Material>
        <Material term="Cal hidratada">También conocida como hidróxido de calcio, la puedes conseguir en ferreterías y tiendas de mejora para el hogar.</Material>
        <Material term="Fructosa en cristales">Se usa para preparar un tinte fermentado que funciona con cualquier fibra. La puedes comprar en tiendas naturistas, de repostería e insumos.</Material>
        <Material term="Sulfato ferroso heptahidratado">Se usa para preparar un tinte que tiñe algodón y lino. Lo puedes conseguir en tiendas de jardinería.</Material>
        <Material term="Vinagre blanco">Sirve para suavizar las telas después de teñir.</Material>
      </MaterialList>
    </ManualLayout>
  )
}
