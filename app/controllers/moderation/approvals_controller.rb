module Moderation
  class ApprovalsController < ApplicationController
    # The scoped, expiring signed token is the bearer credential for this action.
    def show
      comment = Comment.find_signed(params[:token], purpose: :approve)
      unless comment
        return render inertia: "moderation/ApprovalError",
          props: { message: "Enlace de aprobación inválido" }, status: :not_found
      end

      comment.update!(approved: true)
      render inertia: "moderation/ApprovalConfirmation", props: { section: comment.section_path }
    end
  end
end
