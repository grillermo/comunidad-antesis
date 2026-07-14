# Admin-only PDF annotation tool (gated by the authenticate block in routes).
class AnotateController < InertiaController
  def show
    render inertia: "Anotate", props: {
      pageCount: ManualPdfPages::PAGE_COUNT,
      pageAspect: ManualPdfPages.aspect_ratio,
      markers: PdfMarker.order(:page, :created_at).map do |marker|
        { id: marker.id, page: marker.page, x: marker.x.to_f, y: marker.y.to_f }
      end
    }
  end
end
