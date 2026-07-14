# JSON API for the /anotate tool (admin-gated in routes).
class PdfMarkersController < ApplicationController
  def create
    marker = PdfMarker.new(params.require(:pdf_marker).permit(:page, :x, :y))

    if marker.save
      render json: { id: marker.id, page: marker.page, x: marker.x.to_f, y: marker.y.to_f },
        status: :created
    else
      render json: { errors: marker.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    PdfMarker.find(params[:id]).destroy!
    head :no_content
  end
end
