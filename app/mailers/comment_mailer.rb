class CommentMailer < ApplicationMailer
  def admin_notification(comment)
    @comment = comment
    @approve_url = moderation_comment_approval_url(
      token: comment.signed_id(purpose: :approve, expires_in: 7.days)
    )
    admins = User.where(role: :admin).pluck(:email)

    mail(to: admins, subject: "Nuevo comentario en el manual")
  end

  def reply_notification(comment, subscriber)
    @comment = comment
    @section_url = manual_section_url(comment.section_path)

    mail(to: subscriber.email, subject: "Nueva respuesta a tu comentario")
  end

  private

  def manual_section_url(section)
    "#{root_url.chomp('/')}/manual-del-color-vivo/#{section}"
  end
end
