# frozen_string_literal: true

# Static table of contents for the ebook "Manual del Color Vivo".
# No database: the book outline is fixed content, expressed as a tree and
# turned into explicit routes + React pages. Transcribed from the book's
# "Contenido" (project/sections.txt, gitignored). Slugs are STABLE — never
# change a slug once shipped, as it is also the URL and the page file path.
module Manual
  TABLE_OF_CONTENTS = [
    { title: "El origen del color", slug: "el-origen-del-color", children: [
      { title: "Introducción", slug: "introduccion", children: [] },
      { title: "El color en la naturaleza", slug: "el-color-en-la-naturaleza", children: [] },
      { title: "Principios del teñido y extracción de tintes naturales", slug: "principios-del-tenido-y-extraccion-de-tintes-naturales", children: [] },
      { title: "Materiales y herramientas", slug: "materiales-y-herramientas", children: [] },
      { title: "Herramientas básicas", slug: "herramientas-basicas", children: [
        { title: "Materiales para teñir", slug: "materiales-para-tenir", children: [] },
        { title: "Materiales para teñir con índigo", slug: "materiales-para-tenir-con-indigo", children: [] },
        { title: "Materiales para extraer pigmentos", slug: "materiales-para-extraer-pigmentos", children: [] },
        { title: "Materiales para preparar pintura y aglutinantes", slug: "materiales-para-preparar-pintura-y-aglutinantes", children: [] }
      ] },
      { title: "Medidas de seguridad", slug: "medidas-de-seguridad", children: [] },
      { title: "Preparación de carbonatos", slug: "preparacion-de-carbonatos", children: [
        { title: "Receta para preparar carbonato de calcio", slug: "receta-para-preparar-carbonato-de-calcio", children: [] },
        { title: "Receta para preparar carbonato de sodio", slug: "receta-para-preparar-carbonato-de-sodio", children: [] }
      ] }
    ] },
    { title: "Color sobre fibra", slug: "color-sobre-fibra", children: [
      { title: "Elegir el textil", slug: "elegir-el-textil", children: [] },
      { title: "Guía de lavado", slug: "guia-de-lavado", children: [
        { title: "Lavado simple", slug: "lavado-simple", children: [] },
        { title: "Descrudado", slug: "descrudado", children: [] }
      ] },
      { title: "Guía de mordentado", slug: "guia-de-mordentado", children: [
        { title: "Mordientes", slug: "mordientes", children: [] },
        { title: "Receta para mordentar", slug: "receta-para-mordentar", children: [] }
      ] },
      { title: "Guía de teñido", slug: "guia-de-tenido", children: [] },
      { title: "Consejos para teñir ropa", slug: "consejos-para-tenir-ropa", children: [] },
      { title: "Modificadores y tratamientos de color", slug: "modificadores-y-tratamientos-de-color", children: [
        { title: "Ácido tánico", slug: "acido-tanico", children: [
          { title: "Receta de pretratamiento con taninos", slug: "receta-de-pretratamiento-con-taninos", children: [] }
        ] },
        { title: "Sulfato ferroso", slug: "sulfato-ferroso", children: [
          { title: "Receta de baño modificador con sulfato ferroso", slug: "receta-de-bano-modificador-con-sulfato-ferroso", children: [] }
        ] },
        { title: "Dibujos con sulfato ferroso", slug: "dibujos-con-sulfato-ferroso", children: [] },
        { title: "Ácido cítrico", slug: "acido-citrico", children: [
          { title: "Receta para modificar el color de un tinte con ácido cítrico", slug: "receta-para-moditicar-el-color-de-un-tinte-con-acido-citrico", children: [] },
          { title: "Dibujos con ácido cítrico", slug: "dibujos-con-acido-citrico", children: [] },
          { title: "Reservas en negativo con ácido cítrico", slug: "reservas-en-negativo-con-acido-citrico", children: [] }
        ] },
        { title: "Carbonato de calcio", slug: "carbonato-de-calcio", children: [
          { title: "Receta para modificar el color de un tinte con carbonato de calcio", slug: "receta-para-modificar-el-color-de-un-tinte-con-carbonato-de-calcio", children: [] },
          { title: "Receta de baño intensificador con carbonato de calcio", slug: "receta-de-bano-intensificador-con-carbonato-de-calcio", children: [] }
        ] },
        { title: "Leche de soya", slug: "leche-de-soya", children: [
          { title: "Receta de leche de soya casera", slug: "receta-de-leche-de-soya-casera", children: [] },
          { title: "Receta para pretratamiento con leche de soya", slug: "receta-para-pretratamiento-con-leche-de-soya", children: [] }
        ] }
      ] },
      { title: "Teñir con plantas", slug: "tenir-con-plantas", children: [
        { title: "Recomendaciones antes de teñir", slug: "recomendaciones-antes-de-tenir", children: [] },
        { title: "Receta general para teñir con plantas", slug: "receta-general-para-tenir-con-plantas", children: [] },
        { title: "Receta para teñir con cáscara de granada", slug: "receta-para-tenir-con-cascara-de-granada", children: [] },
        { title: "Receta para teñir con palo de Campeche", slug: "receta-para-tenir-con-palo-de-campeche", children: [] },
        { title: "Receta para teñir con rubia", slug: "receta-para-tenir-con-rubia", children: [] }
      ] },
      { title: "Teñir con grana cochinilla", slug: "tenir-con-grana-cochinilla", children: [
        { title: "Guía básica para teñir con grana cochinilla", slug: "guia-basica-para-tenir-con-grana-cochinilla", children: [] }
      ] },
      { title: "Teñir con índigo", slug: "tenir-con-indigo", children: [
        { title: "Receta de tinte de índigo con fructosa", slug: "receta-de-tinte-de-indigo-con-fructosa", children: [] },
        { title: "Receta de tinte de índigo con sulfato ferroso", slug: "receta-de-tinte-de-indigo-con-sulfato-ferroso", children: [] },
        { title: "Resolución de problemas al teñir con índigo", slug: "resolucion-de-problemas-al-tenir-con-indigo", children: [] },
        { title: "Pasta de resistencia para índigo", slug: "pasta-de-resistencia-para-indigo", children: [] }
      ] },
      { title: "Reteñido", slug: "retenido", children: [] },
      { title: "Impresión botánica", slug: "impresion-botanica", children: [] },
      { title: "Hapa zome", slug: "hapa-zome", children: [] },
      { title: "Tinta textil", slug: "tinta-textil", children: [] },
      { title: "Guía de cuidados", slug: "guia-de-cuidados", children: [] }
    ] },
    { title: "Pigmento y polvo", slug: "pigmento-y-polvo", children: [
      { title: "Pigmentos de laca", slug: "pigmentos-de-laca", children: [] },
      { title: "Azul maya", slug: "azul-maya", children: [] },
      { title: "Cernir pigmentos minerales", slug: "cernir-pigmentos-minerales", children: [] }
    ] },
    { title: "Color en movimiento", slug: "color-en-movimiento", children: [
      { title: "Recomendaciones generales", slug: "recomendaciones-generales", children: [] },
      { title: "Tempera", slug: "tempera", children: [] },
      { title: "Tempera grasa", slug: "tempera-grasa", children: [] },
      { title: "Pintura textil", slug: "pintura-textil", children: [] },
      { title: "Aglutinante para pastillas de acuarela", slug: "aglutinante-para-pastillas-de-acuarela", children: [] },
      { title: "Gouache", slug: "gouache", children: [] },
      { title: "Pasteles", slug: "pasteles", children: [
        { title: "Receta para pastel suave", slug: "receta-para-pastel-suave", children: [] },
        { title: "Receta para pastel al óleo", slug: "receta-para-pastel-al-oleo", children: [] }
      ] }
    ] },
    { title: "Color cotidiano", slug: "color-cotidiano", children: [
      { title: "Crayones", slug: "crayones", children: [] },
      { title: "Gises", slug: "gises", children: [] },
      { title: "Tinta botánica", slug: "tinta-botanica", children: [] },
      { title: "Tinta ferrogálica", slug: "tinta-ferrogalica", children: [] },
      { title: "Tinta a base de alcohol", slug: "tinta-a-base-de-alcohol", children: [] },
      { title: "Papel artesanal coloreado", slug: "papel-artesanal-coloreado", children: [] },
      { title: "Antotipia con cúrcuma", slug: "antotipia-con-curcuma", children: [] },
      { title: "Velas", slug: "velas", children: [] },
      { title: "Envoltorios de cera de abeja", slug: "envoltorios-de-cera-de-abeja", children: [] },
      { title: "Masa moldeable", slug: "masa-moldeable", children: [] },
      { title: "Huevos de pascua", slug: "huevos-de-pascua", children: [] }
    ] },
    { title: "Atlas del color", slug: "atlas-del-color", children: [] },
    { title: "Epílogo", slug: "epilogo", children: [] },
    { title: "Glosario", slug: "glosario", children: [] }
  ].freeze

  module_function

  # Where a signed-in reader lands when we have no last-viewed page for them.
  GLOSSARY_PATH = "/manual-del-color-vivo/glosario"

  # The manual URL for a slash-joined path string or an array of slugs, or nil
  # when the path is not a real node (blank, unknown, or a since-removed slug).
  def url_for(path)
    segments = path.is_a?(String) ? path.split("/") : Array(path)
    return nil unless path?(segments)

    "/manual-del-color-vivo/#{segments.join('/')}"
  end

  # Yields |node, path| for every node depth-first, where path is the array of
  # ancestor slugs including the node's own (e.g. %w[part section subsection]).
  def walk(nodes = TABLE_OF_CONTENTS, prefix = [], &block)
    nodes.each do |node|
      path = prefix + [ node[:slug] ]
      block.call(node, path)
      walk(node[:children], path, &block)
    end
  end

  # All node paths as arrays of slugs.
  def paths
    [].tap { |acc| walk { |_node, path| acc << path } }
  end

  # The node at an exact slug path, or nil.
  def find(segments)
    segments = Array(segments).map(&:to_s)
    node = nil
    nodes = TABLE_OF_CONTENTS
    segments.each do |seg|
      node = nodes.find { |n| n[:slug] == seg }
      return nil if node.nil?
      nodes = node[:children]
    end
    node
  end

  # True iff segments is a valid, complete node path.
  def path?(segments)
    !find(segments).nil?
  end

  # The path of the node that follows the given path in reading (depth-first)
  # order, or nil when segments is the last node or not a real path.
  def next_path(segments)
    all = paths
    idx = all.index(Array(segments).map(&:to_s))
    return nil if idx.nil?

    all[idx + 1]
  end
end
