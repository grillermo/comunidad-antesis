import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>El sulfato ferroso es una sal mineral compuesta por hierro, un modificador noble y antiguo. Es el gran oscurecedor; transforma tonos amarillos, cafés o rojos en verdes oliva, grises piedra o negros intensos. Debe usarse con moderación porque puede endurecer o dañar las fibras si se usa en exceso. Se utiliza en una proporción de 1% con respecto al peso del textil. Es irritante, así que úsalo con cuidado y sigue las siguientes medidas de seguridad.</p>
      <Callout><p>Te recomiendo usar un recipiente dedicado solo al hierro, ya que los residuos se quedan en los utensilios y pueden contaminar tintes futuros, manchando colores claros con grises imprevistos. Yo no lo caliento, no lo hiervo ni lo agrego directamente al tinte, para no respirar sus vapores. El sulfato ferroso mancha la piel, la ropa, las mesas y los pisos, así que trabaja sobre una superficie protegida y usa guantes siempre.</p></Callout>
    </ManualLayout>
  )
}
