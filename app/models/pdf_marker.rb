class PdfMarker < ApplicationRecord
  validates :page, presence: true,
    numericality: { only_integer: true, in: 1..ManualPdfPages::PAGE_COUNT }
  validates :x, :y, presence: true, numericality: { in: 0..1 }
end
