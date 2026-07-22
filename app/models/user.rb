class User < ApplicationRecord
  devise :database_authenticatable, :recoverable, :validatable, :rememberable, :trackable

  enum :role, { commenter: "commenter", admin: "admin" }, default: "commenter"

  has_many :comments, dependent: :destroy
  has_many :hearts, dependent: :destroy
  has_many :comment_subscriptions, dependent: :destroy
  has_many :purchases, dependent: :nullify

  before_create :assign_fingerprint_code

  # Opaque per-buyer code baked into the PDF pixel watermark. Never derived
  # from the email so a leaked page can't be reverse-engineered to it.
  def self.generate_fingerprint_code
    loop do
      code = SecureRandom.random_number(2**32 - 1) + 1
      break code unless exists?(fingerprint_code: code)
    end
  end

  private

  def assign_fingerprint_code
    self.fingerprint_code ||= self.class.generate_fingerprint_code
  end
end
