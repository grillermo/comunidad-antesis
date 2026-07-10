class NewsletterEmail < ApplicationRecord
  before_validation :normalize_email

  validates :email,
    presence: { message: "Escribe tu correo." },
    format: { with: URI::MailTo::EMAIL_REGEXP, message: "El correo no es válido." },
    uniqueness: { case_sensitive: false, message: "Ya estás en la lista." }

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
