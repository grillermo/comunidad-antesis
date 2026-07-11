require "rails_helper"

RSpec.describe CommentMarkdown do
  def render(text) = described_class.render(text)

  it "renders basic Markdown" do
    expect(render("**bold** and *italic*")).to include("<strong>bold</strong>")
    expect(render("**bold** and *italic*")).to include("<em>italic</em>")
  end

  it "renders strikethrough, links, and code blocks" do
    expect(render("~~gone~~")).to include("<del>gone</del>")
    expect(render("[x](https://example.com)")).to include('href="https://example.com"')
    expect(render("```\ncode\n```")).to include("<code>")
  end

  it "strips <script> tags" do
    expect(render("hi <script>alert(1)</script>")).not_to include("<script")
  end

  it "strips javascript: hrefs" do
    html = render("[x](javascript:alert(1))")
    expect(html).not_to include("javascript:")
  end

  it "strips inline event handlers and onerror images" do
    html = render('<img src="x" onerror="alert(1)">')
    expect(html).not_to include("onerror")
  end
end
