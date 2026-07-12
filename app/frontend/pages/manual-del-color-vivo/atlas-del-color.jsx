import { useMemo, useState } from 'react'
import ManualLayout from '@/components/ManualLayout'
import Subheading from '@/components/manual/Subheading'
import atlasIllustration from '@/assets/manual/atlas-121.jpg'

const rows = [
  { cientifico: 'Acacia catechu', comun: 'catecú', parte: 'madera', color: 'anaranjado' },
  { cientifico: 'Acacia farnesiana', comun: 'huizache', parte: 'vainas', color: 'gris' },
  { cientifico: 'Achillea millefolium', comun: 'milenrama', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Actinia gaillardia', comun: 'Gaillardia, flor de manta', parte: 'flor', color: 'amarillo' },
  { cientifico: 'Adesmia boronioides', comun: 'paramela', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Aesculus hippocastanum', comun: 'castaño de indias', parte: 'cáscara de fruto', color: 'marrón' },
  { cientifico: 'Agrimonia eupatoria', comun: 'agrimonia', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Alkanna tinctoria', comun: 'ancusa', parte: 'raíz', color: 'marrón' },
  { cientifico: 'Allium cepa', comun: 'cebolla amarilla y morada', parte: 'piel, cáscara', color: 'ocre' },
  { cientifico: 'Alnus acuminata', comun: 'aliso', parte: 'tallos, hojas, corteza, conos', color: 'amarillo' },
  { cientifico: 'Amaranthus spp.', comun: 'amaranto', parte: 'flores', color: 'morado' },
  { cientifico: 'Anarthrophyllum rigidum', comun: 'mata amarilla, guanaco', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Annona muricata', comun: 'guanábana', parte: 'hojas', color: 'amarillo' },
  { cientifico: 'Anthemis tinctoria', comun: 'camomila amarilla', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Artemisia tridentata', comun: 'artemisa grande', parte: 'toda la planta', color: 'amarillo, ocre' },
  { cientifico: 'Baccharis genistelloides', comun: 'carqueja', parte: 'hojas, tallo', color: 'oliva' },
  { cientifico: 'Baccharis magellanica', comun: 'mosaiquillo', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Baccharis salicifolia', comun: 'chilca, azulmiate', parte: 'hojas', color: 'oliva' },
  { cientifico: 'Berberis buxifolia', comun: 'calafate', parte: 'raíz', color: 'amarillo' },
  { cientifico: 'Biancaea sappan', comun: 'palo de Brasil', parte: 'tronco', color: 'magenta, anaranjado, rosa' },
  { cientifico: 'Bixa orellana', comun: 'achiote, anatto', parte: 'semilla', color: 'anaranjado' },
  { cientifico: 'Bocconia arborea', comun: 'mano de león', parte: 'corteza', color: 'amarillo' },
  { cientifico: 'Bocconia frutescens', comun: 'palo amarillo, gordolobo', parte: 'corteza', color: 'anaranjado' },
  { cientifico: 'Caesalpinia coriaria', comun: 'cascalote, dividivi', parte: 'vaina', color: 'ocre, marrón, gris, negro' },
  { cientifico: 'Caesalpinia pulcherrima', comun: 'tabachín del monte', parte: 'corteza', color: 'amarillo, anaranjado' },
  { cientifico: 'Caesalpinia spinosa', comun: 'tara', parte: 'vaina', color: 'amarillo, gris, negro' },
  { cientifico: 'Calendula officinalis', comun: 'caléndula', parte: 'flor', color: 'ocre' },
  { cientifico: 'Calluna vulgaris', comun: 'brezo', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Camellia sinensis', comun: 'té negro', parte: 'hojas', color: 'beige, marrón' },
  { cientifico: 'Capsicum annuum', comun: 'paprika, pimentón', parte: 'fruto', color: 'amarillo' },
  { cientifico: 'Carthamus tinctorius', comun: 'cártamo', parte: 'flor', color: 'ocre' },
  { cientifico: 'Carya ovata', comun: 'nogal americano', parte: 'cáscara de fruto', color: 'marrón' },
  { cientifico: 'Cassia fistula', comun: 'caña fístula', parte: 'corteza', color: 'amarillo' },
  { cientifico: 'Castilleja integra', comun: 'pincel indio', parte: 'flor', color: 'marrón' },
  { cientifico: 'Centaurea cyanus', comun: 'aciano', parte: 'flor', color: 'azul' },
  { cientifico: 'Cercocarpus montanus', comun: 'caoba de montaña', parte: 'corteza, hojas', color: 'marrón' },
  { cientifico: 'Chamaemelum nobile', comun: 'manzanilla', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Chiliotrichum diffusum', comun: 'mata negra fueguina', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Cinchona pubescens', comun: 'quina roja', parte: 'corteza', color: 'rosa, anaranjado, marrón' },
  { cientifico: 'Cinnamomum verum', comun: 'canela', parte: 'corteza', color: 'marrón' },
  { cientifico: 'Cirsium jorullense', comun: 'cardo santo', parte: 'tallos, raíz, hojas', color: 'amarillo' },
  { cientifico: 'Clitoria ternatea', comun: 'guisante azul', parte: 'flor', color: 'violeta' },
  { cientifico: 'Commelina communis', comun: 'comelina', parte: 'flor', color: 'violeta' },
  { cientifico: 'Cordia boissieri', comun: 'anacahuita', parte: 'ramas, hojas', color: 'oliva' },
  { cientifico: 'Coreopsis tinctoria', comun: 'coreopsis', parte: 'flor', color: 'ocre' },
  { cientifico: 'Cosmos bipinnatus', comun: 'cosmos', parte: 'flor', color: 'amarillo' },
  { cientifico: 'Cosmos bipinnatus', comun: 'mirasol', parte: 'tallo, hojas', color: 'oliva' },
  { cientifico: 'Crocus sativus', comun: 'azafrán', parte: 'pistilo', color: 'ocre' },
  { cientifico: 'Curcuma longa', comun: 'cúrcuma', parte: 'raíz', color: 'ocre' },
  { cientifico: 'Cuscuta corymbosa', comun: 'cabello de ángel', parte: 'toda la planta', color: 'anaranjado' },
  { cientifico: 'Cuscuta tinctoria', comun: 'barba de león', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Dactylopius coccus', comun: 'grana cochinilla', parte: 'insecto', color: 'rojo, rosa, magenta, anaranjado, morado' },
  { cientifico: 'Dahlia coccinea', comun: 'dalia', parte: 'flor', color: 'anaranjado' },
  { cientifico: 'Daucus carota', comun: 'zanahoria', parte: 'hojas', color: 'amarillo' },
  { cientifico: 'Diospyros nigra', comun: 'zapote negro', parte: 'corteza', color: 'oliva, gris' },
  { cientifico: 'Diospyros nigra', comun: 'zapote negro', parte: 'fruto', color: 'marrón' },
  { cientifico: 'Empetrum rubrum', comun: 'murtilla', parte: 'toda la planta', color: 'marrón' },
  { cientifico: 'Enterolobium spp.', comun: 'guanacaste', parte: 'corteza, semilla', color: 'marrón' },
  { cientifico: 'Ericameria nauseosa', comun: 'chamisa', parte: 'flor', color: 'amarillo' },
  { cientifico: 'Erythrina americana', comun: 'colorín', parte: 'corteza, tallo, flor', color: 'amarillo' },
  { cientifico: 'Eucalyptus spp.', comun: 'eucalipto', parte: 'hojas, ramas', color: 'amarillo, marrón, rojo, gris' },
  { cientifico: 'Eysenhardtia polystachya', comun: 'palo azul', parte: 'tronco', color: 'amarillo' },
  { cientifico: 'Ficus pertusa', comun: 'camichín', parte: 'fruto', color: 'ocre' },
  { cientifico: 'Flueggea tinctoria', comun: 'tamujo', parte: 'fruto, madera', color: 'ocre' },
  { cientifico: 'Galium verum', comun: 'galio amarillo', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Genista tinctoria', comun: 'genista', parte: 'ramas, flor', color: 'amarillo' },
  { cientifico: 'Grindelia chiloensis', comun: 'botón de oro, melosa', parte: 'flor', color: 'amarillo' },
  { cientifico: 'Gutierrezia sarothrae', comun: 'hierba de san Nicolás', parte: 'flor', color: 'ocre' },
  { cientifico: 'Haematoxylum campechianum', comun: 'palo de Campeche', parte: 'tronco', color: 'violeta, gris, negro' },
  { cientifico: 'Ilex paraguariensis, Ilex spp.', comun: 'yerba mate, acebo', parte: 'hojas', color: 'oliva, marrón, gris' },
  { cientifico: 'Indigofera suffruticosa', comun: 'jiquilite', parte: 'tallos, hojas', color: 'azul' },
  { cientifico: 'Indigofera tinctoria', comun: 'índigo verdadero', parte: 'hojas, tallos', color: 'azul' },
  { cientifico: 'Iris pseudacorus', comun: 'iris', parte: 'raíz', color: 'gris' },
  { cientifico: 'Isatis tinctoria', comun: 'hierba pastel, glasto', parte: 'tallos, hojas', color: 'azul' },
  { cientifico: 'Juglans nigra', comun: 'nogal negro', parte: 'cáscara del fruto', color: 'marrón, beige, negro' },
  { cientifico: 'Juglans spp.', comun: 'nuez', parte: 'cáscara de fruto', color: 'marrón' },
  { cientifico: 'Juniperus communis', comun: 'enebro', parte: 'corteza', color: 'marrón' },
  { cientifico: 'Justicia spicigera', comun: 'muitle, muicle', parte: 'hojas, tallo', color: 'morado' },
  { cientifico: 'Kerria lacca', comun: 'laca', parte: 'insecto', color: 'rojo, rosa, magenta, anaranjado, morado' },
  { cientifico: 'Lantana camara', comun: 'cinco negritos', parte: 'fruto', color: 'morado, gris' },
  { cientifico: 'Laurus nobilis', comun: 'laurel', parte: 'hojas', color: 'amarillo' },
  { cientifico: 'Lawsonia inermis', comun: 'henna, arjena', parte: 'hojas', color: 'marrón' },
  { cientifico: 'Lepidophyllum cupressiforme', comun: 'mata verde', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Luma apiculata', comun: 'arrayán', parte: 'hojas, ramas', color: 'amarillo' },
  { cientifico: 'Maclura tinctoria', comun: 'moral', parte: 'corteza, madera', color: 'oliva, amarillo' },
  { cientifico: 'Mangifera indica', comun: 'mango', parte: 'hojas, corteza', color: 'amarillo' },
  { cientifico: 'Medicago sativa', comun: 'alfalfa', parte: 'hojas, tallo', color: 'oliva' },
  { cientifico: 'Mentha spp.', comun: 'menta', parte: 'hojas', color: 'marrón' },
  { cientifico: 'Misodendrum punctulatum', comun: 'farolito chino', parte: 'flor', color: 'anaranjado' },
  { cientifico: 'Morus alba', comun: 'morera', parte: 'hojas', color: 'oliva, gris' },
  { cientifico: 'Mulguraea tridens', comun: 'mata negra', parte: 'toda la planta', color: 'marrón' },
  { cientifico: 'Musa spp.', comun: 'plátano', parte: 'cáscara', color: 'beige, marrón' },
  { cientifico: 'Nardophyllum bryoides', comun: 'mata torcida', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Nassauvia glomerulosa', comun: 'nasavia, colapiche', parte: 'toda la planta', color: 'marrón' },
  { cientifico: 'Nicotiana tabacum', comun: 'tabaco', parte: 'hojas', color: 'amarillo, marrón' },
  { cientifico: 'Nothofagus antarctica', comun: 'ñire', parte: 'corteza', color: 'marrón' },
  { cientifico: 'Nothofagus pumilio', comun: 'lenga', parte: 'madera', color: 'marrón' },
  { cientifico: 'Oxalis stricta', comun: 'oxalis, hierba agria', parte: 'flores', color: 'amarillo' },
  { cientifico: 'Persea americana', comun: 'aguacate', parte: 'semilla, cáscara de fruto', color: 'rosa, marrón' },
  { cientifico: 'Persicaria tinctoria', comun: 'índigo japonés', parte: 'hojas, tallos', color: 'azul' },
  { cientifico: 'Philenoptera cyanescens', comun: 'índigo yoruba, elu', parte: 'hojas, tallos', color: 'azul' },
  { cientifico: 'Pithecellobium dulce', comun: 'guamúchil', parte: 'vainas', color: 'amarillo' },
  { cientifico: 'Pithecellobium dulce', comun: 'guamúchil', parte: 'raíz', color: 'oliva' },
  { cientifico: 'Prunus serotina', comun: 'capulín', parte: 'corteza', color: 'marrón' },
  { cientifico: 'Psidium guajava', comun: 'guayabo', parte: 'hojas, corteza', color: 'rosa, marrón, beige' },
  { cientifico: 'Punica granatum', comun: 'granado', parte: 'cáscara de fruto', color: 'amarillo' },
  { cientifico: 'Quercus', comun: 'roble', parte: 'corteza, hojas', color: 'beige, marrón' },
  { cientifico: 'Quercus ilex', comun: 'encino', parte: 'corteza, bellota', color: 'marrón' },
  { cientifico: 'Quercus lusitanica, Quercus infectoria', comun: 'agallas de roble', parte: 'agallas', color: 'gris, negro' },
  { cientifico: 'Reseda luteola', comun: 'gualda', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Rhamnus infectorius, R. amygdalinus, R. oleoides', comun: 'arraclán', parte: 'bayas', color: 'amarillo' },
  { cientifico: 'Rhamnus infectorius, R. amygdalinus, R. oleoides', comun: 'arraclán', parte: 'corteza', color: 'anaranjado' },
  { cientifico: 'Rheum rhabarbarum', comun: 'ruibarbo', parte: 'raíz', color: 'ocre' },
  { cientifico: 'Rhus spp.', comun: 'zumaque', parte: 'fruto', color: 'rosa' },
  { cientifico: 'Rhus spp.', comun: 'zumaque', parte: 'hojas, corteza', color: 'amarillo, gris' },
  { cientifico: 'Ribes rubrum', comun: 'grosellero', parte: 'fruto', color: 'rosa' },
  { cientifico: 'Robinia pseudoacacia', comun: 'acacia blanca', parte: 'ramas, hojas, flores', color: 'oliva' },
  { cientifico: 'Rosmarinus officinalis', comun: 'romero', parte: 'hojas, ramas', color: 'marrón' },
  { cientifico: 'Rubia cordifolia', comun: 'rubia de la India, manjistha', parte: 'raíz', color: 'anaranjado, marrón, coral' },
  { cientifico: 'Rubia tinctorum', comun: 'rubia', parte: 'raíz', color: 'rojo, coral, anaranjado, marrón' },
  { cientifico: 'Rumex acetosa', comun: 'acedera', parte: 'toda la planta', color: 'amarillo, ocre, oliva' },
  { cientifico: 'Salvia purpurea', comun: 'salvia purpúrea', parte: 'flores', color: 'morado' },
  { cientifico: 'Sambucus spp.', comun: 'saúco', parte: 'hojas', color: 'amarillo' },
  { cientifico: 'Schinopsis balansae', comun: 'quebracho', parte: 'tronco, corteza', color: 'anaranjado, rosa, marrón, beige' },
  { cientifico: 'Schinus marchandii', comun: 'molle', parte: 'toda la planta', color: 'marrón' },
  { cientifico: 'Schinus molle', comun: 'pirul', parte: 'hojas, ramas', color: 'amarillo, oliva, gris, negro' },
  { cientifico: 'Senecio filaginoides', comun: 'mata mora', parte: 'toda la planta', color: 'ocre' },
  { cientifico: 'Solanum nigrescens', comun: 'hierba mora', parte: 'fruto', color: 'morado, gris' },
  { cientifico: 'Solidago canadensis, Solidago virgaurea', comun: 'vara de oro, solidago', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Stachys officinalis', comun: 'betónica', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Strobilanthes cusia', comun: 'índigo de Assam', parte: 'hojas, tallos', color: 'azul' },
  { cientifico: 'Tagetes erecta', comun: 'cempasúchil', parte: 'flor', color: 'amarillo' },
  { cientifico: 'Tagetes lucida', comun: 'pericón', parte: 'tallo, hoja, flor', color: 'amarillo' },
  { cientifico: 'Tagetes lunulata', comun: 'cinco llagas', parte: 'flor', color: 'amarillo' },
  { cientifico: 'Tanacetum parthenium', comun: 'altamisa', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Tanacetum vulgare', comun: 'tanaceto', parte: 'flor', color: 'amarillo' },
  { cientifico: 'Taraxacum spp.', comun: 'diente de león', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Tectona grandis', comun: 'teca', parte: 'hojas', color: 'rosa, rojo, marrón' },
  { cientifico: 'Terminalia chebula', comun: 'mirobálano amarillo', parte: 'fruto', color: 'amarillo' },
  { cientifico: 'Tillandsia usneoides', comun: 'musgo español, barba de viejo', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Tithonia diversifolia', comun: 'girasol', parte: 'pétalos', color: 'amarillo' },
  { cientifico: 'Urtica dioica', comun: 'ortiga mayor', parte: 'hojas', color: 'oliva' },
  { cientifico: 'Usnea barbata', comun: 'liquen barba, musgo español', parte: 'toda la planta', color: 'amarillo' },
  { cientifico: 'Viola × wittrockiana', comun: 'pensamientos', parte: 'flores', color: 'amarillo, morado, anaranjado' },
]

const columns = [
  { key: 'cientifico', label: 'Nombre científico', italic: true },
  { key: 'comun', label: 'Nombre común', italic: false },
  { key: 'parte', label: 'Parte utilizada', italic: false },
  { key: 'color', label: 'Color obtenido', italic: false },
]

function SortableTable() {
  const [sortKey, setSortKey] = useState('cientifico')
  const [sortDir, setSortDir] = useState('asc')

  const sorted = useMemo(() => {
    const collator = new Intl.Collator('es', { sensitivity: 'base' })
    const dir = sortDir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => dir * collator.compare(a[sortKey], b[sortKey]))
  }, [sortKey, sortDir])

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm leading-6">
        <thead>
          <tr>
            {columns.map((col) => {
              const active = col.key === sortKey
              return (
                <th key={col.key} className="border-b-2 border-orange p-0 text-left align-bottom">
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className="flex w-full items-center gap-1 px-3 py-2 text-left font-display font-semibold text-orange-ink hover:text-orange"
                  >
                    <span>{col.label}</span>
                    <span className="text-xs" aria-hidden="true">
                      {active ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={`${row.cientifico}-${row.parte}-${i}`}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`border-b border-blue/10 px-3 py-2 align-top ${col.italic ? 'italic' : ''}`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <img
        className="h-auto w-full border border-blue/10"
        src={atlasIllustration}
        alt="Ilustración del Atlas del color: flores, hojas y semillas sobre fondo azul"
        width="1400"
        height="2159"
      />

      <Subheading>Índice cromático: tintes y sus gamas de color</Subheading>

      <p>
        En esta tabla te comparto información para consultar hojas, semillas, cortezas, cáscaras,
        flores, frutos, raíces y tallos de plantas, arbustos, árboles e insectos que han sido
        utilizados históricamente como colorantes para teñir y que tienen buena fijación con
        mordientes de aluminio.
      </p>

      <p>
        Considera que esta no es una lista exhaustiva. Una pieza fundamental del teñido natural es
        investigar y rescatar la información de los materiales naturales que han servido para teñir
        en el lugar donde vives. Te invito a hacerlo para encontrar aquellos recursos que tienes más
        cerca y que quizás estén por olvidarse.
      </p>

      <p>
        Antes de recolectar, observa el lugar con calma. Identifica las plantas; investiga si es una
        especie nativa, introducida, invasiva o en peligro. No recolectes nada si estás en un área
        protegida o reserva natural. Asegúrate de recolectar solo entre el 10% y el 20% de lo que
        encuentres: no más de una de cada diez hojas, ramas, flores o frutos visibles. Eso permite
        que la planta siga creciendo, reproduciéndose y que los animales que dependen de ella sigan
        alimentándose. Si es una planta de crecimiento lento, una raíz, una corteza o un fruto que se
        cosecha una vez al año, recolecta menos. Nunca tomes la primera planta que veas, nunca
        arranques toda una planta de raíz a menos que vayas a usarla completa y la especie lo
        permita; pódala correctamente. Nunca recolectes en zonas con contaminación, como bordes de
        carretera o áreas industriales. Si no sabes qué planta tienes enfrente, no la uses.
      </p>

      <p>
        En la siguiente tabla encontrarás cada planta o insecto con la parte que se utiliza y los
        tonos que produce. Úsala para planear tus tintes o para identificar qué tienes a la mano.
      </p>

      <p>
        Esta lista está ordenada por nombre científico. Me di cuenta, trabajando con mis propias
        fuentes, que es más fácil investigar las propiedades tintóreas de una planta por su nombre
        científico que por su nombre común, ya que este último varía mucho de región en región. Te
        recomiendo acostumbrarte a buscarlas así. Toca cualquier encabezado de la tabla para
        reordenarla por esa columna.
      </p>

      <SortableTable />
    </ManualLayout>
  )
}
