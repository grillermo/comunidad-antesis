class NewsletterEmailsController < InertiaController
  def create
    record = NewsletterEmail.new(newsletter_email_params)

    if record.save
      redirect_to root_path, flash: { subscribed: true }
    elsif duplicate?(record)
      redirect_to root_path, flash: { already_subscribed: true }
    else
      redirect_to root_path, inertia: { errors: record.errors }
    end
  rescue ActiveRecord::RecordNotUnique
    redirect_to root_path, flash: { already_subscribed: true }
  end

  private

  def newsletter_email_params
    params.permit(:email, :source)
  end

  def duplicate?(record)
    record.errors.details[:email].any? { |detail| detail[:error] == :taken }
  end
end
