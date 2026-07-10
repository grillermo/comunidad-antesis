class User < ApplicationRecord
  devise :database_authenticatable, :validatable, :rememberable, :trackable

  enum :role, { commenter: "commenter", admin: "admin" }, default: "commenter"
end
