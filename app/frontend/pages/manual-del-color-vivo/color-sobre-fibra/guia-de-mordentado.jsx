import ManualLayout from '@/components/ManualLayout'
import Callout from '@/components/manual/Callout'

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <p>No siempre es necesario usar mordientes para teñir con tintes naturales. Hay algunos colores que se adhieren directamente a las fibras textiles. Sin embargo, la mayoría los requieren para fijar el color y mejorar en intensidad y durabilidad.</p>
      <p>Desde tiempos antiguos, los tintoreros han experimentado con sustancias minerales como sales, óxidos o barro, y sustancias orgánicas como orina, sangre y plantas, antes, durante o después del teñido. Todas estas prácticas se consideran formas de mordentado.</p>
      <p>Aunque existen recetas históricas muy complejas y muchos tipos de mordientes, a mí me gusta mordentar remojando la fibra en agua con una mezcla de sales metálicas a base de aluminio. A veces hago un baño preliminar alto en taninos o en leche de soya para las fibras de celulosa, o agrego crémor tártaro a las sales metálicas cuando tiño fibras de proteína. Son los atajos que me han funcionado después de años de probar.</p>
      <p>El siguiente paso que hago es extraer el color poniendo plantas u otros colorantes a hervir, filtrarlos e introducir el textil ya mordentado. Si necesito modificar el color, utilizo mordientes modificadores de color —como carbonato de calcio, plantas altas en taninos, ácido cítrico o sulfato ferroso— algunos de estos directamente en el tinte, pero de preferencia en un baño posterior. Más adelante te cuento todos los detalles en Modificadores y tratamientos de color.</p>
      <p>Para mi la seguridad es primero y no utilizo sales metálicas de metales pesados, brebajes hechos en casa ni procedimientos engorrosos. No me parece coherente utilizar materiales que son tóxicos, de composición incierta o que desperdician recursos sin mejorar el resultado.</p>
      <p>Y ya que estamos aclarando cosas: el vinagre y la sal de mesa no fijan el color. Esta creencia se popularizó porque las anilinas —tintes sintéticos que llegaron a finales del siglo XIX— sí necesitaban estos aditivos para disolverse y aplicarse mejor sobre la fibra. Con el tiempo, la receta se heredó sin cuestionarla, pero en el teñido natural no cumplen esa función.</p>
      <p>El aluminio es uno de los metales más abundantes en la Tierra. Sus derivados han sido utilizados por tintoreros durante siglos, tanto artesanalmente como a nivel industrial, y forman un verdadero puente químico entre un textil y un tinte natural que fija el color.</p>
      <p>Ninguno de los mordientes en este manual requiere medidas especiales de seguridad para manipularlos. Sin embargo, pueden resultar astringentes en contacto prolongado con la piel. Te recomiendo usar guantes y preferir los de grado cosmético o alimenticio.</p>
    </ManualLayout>
  )
}
