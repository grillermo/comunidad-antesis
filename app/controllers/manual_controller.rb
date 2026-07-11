# frozen_string_literal: true

# Serves the static ebook pages. No models: routes are drawn from
# Manual::TABLE_OF_CONTENTS in config/routes.rb, and each route pins the
# component to render via its `component` default (never user input).
class ManualController < InertiaController
  before_action :authenticate_user!

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
