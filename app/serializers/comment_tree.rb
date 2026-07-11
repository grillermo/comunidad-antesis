# Builds the ordered, nested comment payload for one manual section, with
# per-viewer permission and heart flags. Consumed as an Inertia prop.
class CommentTree
  def initialize(section_path:, current_user:)
    @section_path = section_path
    @current_user = current_user
  end

  def as_json(*)
    comments = Comment.where(section_path: @section_path).includes(:user)
    @hearted_ids = hearted_ids(comments)
    by_parent = comments.group_by(&:parent_id)

    build(by_parent[nil] || [], by_parent, root: true)
  end

  private

  def hearted_ids(comments)
    return Set.new unless @current_user

    @current_user.hearts.where(comment_id: comments.map(&:id)).pluck(:comment_id).to_set
  end

  def build(nodes, by_parent, root:)
    ordered = root ? sort_roots(nodes) : nodes.sort_by(&:created_at)
    ordered.map do |comment|
      node(comment).merge(replies: build(by_parent[comment.id] || [], by_parent, root: false))
    end
  end

  def sort_roots(nodes)
    nodes.sort_by { |comment| [comment.sticky? ? 0 : 1, -comment.hearts_count, -comment.created_at.to_f] }
  end

  def node(comment)
    {
      id: comment.id,
      author: comment.deleted? ? nil : comment.user.email,
      body: can_edit?(comment) ? comment.body : nil,
      body_html: comment.display_body_html,
      hearts_count: comment.hearts_count,
      hearted: @hearted_ids.include?(comment.id),
      sticky: comment.sticky,
      approved: comment.approved,
      deleted: comment.deleted?,
      created_at: comment.created_at.iso8601,
      can_edit: can_edit?(comment),
      can_delete: can_delete?(comment),
      can_moderate: admin?
    }
  end

  def can_edit?(comment)
    return false if comment.deleted?

    admin? || comment.user_id == @current_user&.id
  end

  alias_method :can_delete?, :can_edit?

  def admin? = @current_user&.admin? || false
end
