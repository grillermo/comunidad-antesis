# Hardcoded launch switch: the sales home page and checkout activate on this
# date (spec: docs/superpowers/specs/2026-07-15-stripe-manual-sales-design.md).
module SalesLaunch
  LAUNCH_DATE = Date.new(2023, 8, 15)

  def self.live?
    Date.current >= LAUNCH_DATE
  end
end
