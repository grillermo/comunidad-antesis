require "rails_helper"

RSpec.describe "Manual section comments prop", type: :request do
  def page_props(response)
    node = Nokogiri::HTML(response.body).at_css("script[data-page]")
    JSON.parse(node.text).fetch("props")
  end

  let(:user) { create(:user) }

  it "includes a comments prop for the section" do
    create(:comment, section_path: "el-origen-del-color/introduccion", user: user, body: "hola")
    sign_in user

    get "/manual-del-color-vivo/el-origen-del-color/introduccion"

    expect(response).to have_http_status(:ok)
    props = page_props(response)
    expect(props.fetch("section")).to eq("el-origen-del-color/introduccion")
    expect(props.fetch("comments").first.fetch("body_html")).to include("hola")
  end
end
