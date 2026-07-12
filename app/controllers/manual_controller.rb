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

    remember_last_manual_path

    next_node_path = Manual.next_path(segments)

    render inertia: "manual-del-color-vivo/#{params[:component]}", props: {
      title: node[:title],
      section: params[:component],
      nextPage: next_node_path && {
        title: Manual.find(next_node_path)[:title],
        url: Manual.url_for(next_node_path)
      },
      comments: InertiaRails.defer {
        CommentTree.new(
          section_path: params[:component],
          current_user: Current.user
        ).as_json
      }
    }
  end

  private

  # Persist where the reader is so we can send them back here on next login.
  # update_column: a read-path write with no need for validations or timestamps.
  def remember_last_manual_path
    return if request.headers["Purpose"] == "prefetch"

    user = Current.user
    return if user.nil? || user.last_manual_path == params[:component]

    user.update_column(:last_manual_path, params[:component])
  end
end
