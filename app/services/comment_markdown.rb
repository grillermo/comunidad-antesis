# Renders user Markdown to sanitized, trusted HTML for threads and emails.
class CommentMarkdown
  ALLOWED_TAGS = %w[
    p br strong em del a code pre blockquote
    ul ol li h1 h2 h3 h4 h5 h6 hr
    table thead tbody tr th td img
  ].freeze

  ALLOWED_ATTRIBUTES = %w[href src alt title].freeze

  def self.render(text)
    return "" if text.blank?

    raw = Commonmarker.to_html(
      text,
      options: {
        extension: {
          strikethrough: true,
          table: true,
          autolink: true,
          tagfilter: true
        }
      }
    )

    ActionController::Base.helpers.sanitize(
      raw,
      tags: ALLOWED_TAGS,
      attributes: ALLOWED_ATTRIBUTES
    )
  end
end
