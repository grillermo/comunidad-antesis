class Comment < ApplicationRecord
  TOMBSTONE_HTML = "<p>[eliminado]</p>".freeze

  has_ancestry

  belongs_to :user
  has_many :hearts, dependent: :destroy
  has_many :comment_subscriptions, dependent: :destroy
  has_many :subscribers, through: :comment_subscriptions, source: :user

  validates :body, presence: true
  validate :section_path_must_exist
  validate :sticky_only_on_root
  validate :parent_must_be_active_and_in_same_section

  before_save :render_body_html, if: :will_save_change_to_body?

  scope :active, -> { where(deleted_at: nil) }

  def deleted? = deleted_at.present?

  def soft_delete!
    update!(deleted_at: Time.current)
  end

  def display_body_html
    deleted? ? TOMBSTONE_HTML : body_html
  end

  private

  def render_body_html
    self.body_html = CommentMarkdown.render(body)
  end

  def section_path_must_exist
    return if section_path.present? && Manual.path?(section_path.split("/"))

    errors.add(:section_path, "is not a known manual section")
  end

  def sticky_only_on_root
    errors.add(:sticky, "is only allowed on root comments") if sticky? && parent.present?
  end

  def parent_must_be_active_and_in_same_section
    return unless parent
    return unless new_record? || will_save_change_to_ancestry? || will_save_change_to_section_path?

    errors.add(:parent, "is deleted") if parent.deleted?
    errors.add(:parent, "belongs to another section") if parent.section_path != section_path
  end
end
