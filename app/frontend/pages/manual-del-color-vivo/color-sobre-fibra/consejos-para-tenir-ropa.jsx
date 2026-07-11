import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>Teñir ropa, ya sea comercial o algo que hayas hecho tú, es de los proyectos más divertidos con tintes naturales. A mí me gusta hacerlo en prendas que se han desteñido, tienen manchas o a las que quiero dar una oportunidad de seguir usándolas de otra manera.</p>
      <p>Lo más importante que debes saber es que, para obtener buenos resultados, la ropa debe ser al menos 70% de origen natural. Más allá de eso, puedes seguir las mismas instrucciones de este manual junto con los siguientes consejos:</p>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Aunque la ropa que vayas a teñir sea usada, lávala muy bien antes de teñir. Si la prenda tiene manchas previas de comida, sudor o desodorante, te recomiendo hacer un lavado tipo descrudado con carbonato de sodio y considera que esas zonas pueden quedar más oscuras o más claras que el resto.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>El hilo que se utiliza para confeccionar prendas comerciales suele ser de poliéster, una fibra sintética, lo que significa que no se va a teñir naturalmente. A mí regularmente no me molesta el contraste, pero quiero anticiparte para que no te sorprenda el resultado. Considera que esto puede pasarte también con los cierres y algunos bordados. Si quieres usar un hilo lo suficientemente resistente para tus proyectos de costura y que se tiña naturalmente, te recomiendo el hilo 100 % algodón para acolchar (quilting).</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Algunas partes metálicas como cierres, remaches y botones reaccionan con las sales metálicas del mordentado y pueden dejar manchas cuando se frotan con la tela por mucho tiempo. Antes de introducirlas al tinte, enjuaga bien todas las partes metálicas con agua y evita que toquen demasiado la tela mientras la tiñes. No es tan instantáneo: si se rozan un poco, no pasa nada. Las manchas grises aparecen después de que se rocen durante varios minutos.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Yo prefiero teñir todos los suéteres en frío para que no se afieltren.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Siempre que tiño ropa, filtro todo el material vegetal del tinte y muevo la prenda constantemente para que el color quede parejo.</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Baja tus expectativas: no comiences tiñendo tu ropa favorita ni ropa nueva. Al principio todo lo que hagas traerá sorpresas (en muchos casos son sorpresas felices, así que tampoco permitas que esto te detenga).</li></ul>
      <ul className="list-disc space-y-3 pl-6 marker:text-orange"><li>Recuerda que lo más importante es divertirte y experimentar.</li></ul>
    </ManualLayout>
  )
}
