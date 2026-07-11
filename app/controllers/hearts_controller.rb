class HeartsController < ApplicationController
  before_action :authenticate_user!

  def create
    comment = Comment.find(params[:comment_id])
    toggle(comment) unless comment.deleted?
    redirect_to "/manual-del-color-vivo/#{comment.section_path}"
  end

  private

  def toggle(comment)
    heart = Heart.find_by(user: Current.user, comment: comment)
    heart ? heart.destroy : Heart.create!(user: Current.user, comment: comment)
  end
end
