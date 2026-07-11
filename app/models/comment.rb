class Comment < ApplicationRecord
  has_ancestry

  belongs_to :user

  validates :body, presence: true
  validate :section_path_must_exist

  before_save :render_body_html, if: :will_save_change_to_body?

  private

  def render_body_html
    self.body_html = CommentMarkdown.render(body)
  end

  def section_path_must_exist
    return if section_path.present? && Manual.path?(section_path.split("/"))

    errors.add(:section_path, "is not a known manual section")
  end
end
