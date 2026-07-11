# frozen_string_literal: true

# Serves the static ebook pages. No models: routes are drawn from
# Manual::TABLE_OF_CONTENTS in config/routes.rb, and each route pins the
# component to render via its `component` default (never user input).
class ManualController < InertiaController
  before_action :authenticate_user!

  # Dev-only: expose the section's source-PDF page range so ManualLayout can
  # render the side-by-side validation view. Evaluated per request (needs
  # params[:component]); a no-op in every other environment, so the prop never
  # reaches the client outside development. Mirrors InertiaController's
  # `inertia_share user: -> { ... }` pattern.
  inertia_share do
    next unless Rails.env.development?

    range = Manual.pdf_page_range(params[:component])
    { pdfPages: range && (range.first..range.last).to_a }
  end

  def index
    render inertia: "manual-del-color-vivo/Index", props: {
      contents: Manual::TABLE_OF_CONTENTS
    }
  end

  def show
    segments = params[:component].split("/")
    node = Manual.find(segments)
    raise ActiveRecord::RecordNotFound unless node

    render inertia: "manual-del-color-vivo/#{params[:component]}", props: {
      title: node[:title]
    }
  end
end
