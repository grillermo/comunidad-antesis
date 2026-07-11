require "rails_helper"

RSpec.describe "Manual PDF pages", type: :request do
  # The rasterize route is drawn ONLY in development. In the test env it does
  # not exist, so the router returns 404 (test env renders RoutingError as 404;
  # same mechanism spec/requests/manual_spec.rb relies on for unknown slugs).
  it "does not expose the dev rasterize route outside development" do
    expect(Rails.env.development?).to be(false) # sanity: we are in test env
    get "/dev/manual_pdf_pages/1.png"
    expect(response).to have_http_status(:not_found)
  end
end
