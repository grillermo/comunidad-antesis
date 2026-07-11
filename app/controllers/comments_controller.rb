class CommentsController < ApplicationController
  before_action :authenticate_user!

  def create
    comment = Current.user.comments.build(create_params)
    comment.parent = Comment.find(params[:comment][:parent_id]) if params[:comment][:parent_id].present?

    if comment.save
      subscribe(comment) if params[:subscribe].present?
      notify(comment) if defined?(CommentMailer)
      redirect_to section_path_url(comment.section_path)
    else
      redirect_to section_path_url(create_params[:section_path]),
        inertia: { errors: comment.errors }, status: :unprocessable_content
    end
  end

  def update
    comment = Comment.find(params[:id])
    return head :forbidden unless can_modify?(comment)

    comment.update!(params.require(:comment).permit(:body))
    redirect_to section_path_url(comment.section_path)
  end

  private

  def create_params
    params.require(:comment).permit(:section_path, :body)
  end

  def subscribe(comment)
    CommentSubscription.find_or_create_by(user: Current.user, comment: comment)
  end

  def notify(comment)
    CommentMailer.admin_notification(comment).deliver_later
    return unless comment.parent

    comment.parent.subscribers.where.not(id: Current.user.id).find_each do |subscriber|
      CommentMailer.reply_notification(comment, subscriber).deliver_later
    end
  end

  def section_path_url(section)
    "/manual-del-color-vivo/#{section}"
  end

  def can_modify?(comment)
    !comment.deleted? && (Current.user.admin? || comment.user_id == Current.user.id)
  end
end
