class Heart < ApplicationRecord
  belongs_to :user
  belongs_to :comment, counter_cache: :hearts_count

  validates :user_id, uniqueness: { scope: :comment_id }
end
