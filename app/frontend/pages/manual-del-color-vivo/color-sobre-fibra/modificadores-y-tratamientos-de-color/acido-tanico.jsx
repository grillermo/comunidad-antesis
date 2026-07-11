import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Los taninos son moléculas astringentes presentes en las plantas, principalmente en las cortezas, maderas y frutos. En la naturaleza, las protegen de hongos, bacterias e insectos. Por eso, han formado parte de nuestra alimentación durante miles de años y se han extraído y utilizado en cosmética, teñido y curtido de pieles.</p>
      <p>La fuente de taninos más eficaz y fácil de conseguir para este proceso es el ácido tánico. Es un polvo que puedes comprar en tiendas especializadas de teñido y droguerías. También puedes usar otras fuentes ricas en taninos, como agallas de roble en polvo, zumaque, tara, mirobálano, catecú, corteza de encino, cáscaras de granada, acacia o cáscaras de nuez.</p>
    </ManualLayout>
  )
}
