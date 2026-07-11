class User < ApplicationRecord
  devise :database_authenticatable, :validatable, :rememberable, :trackable

  enum :role, { commenter: "commenter", admin: "admin" }, default: "commenter"

  has_many :comments, dependent: :destroy
  has_many :hearts, dependent: :destroy
  has_many :comment_subscriptions, dependent: :destroy
end
