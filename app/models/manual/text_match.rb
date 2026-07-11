# frozen_string_literal: true

module Manual
  # Small, dependency-free text utilities for the (dev-only) PDF page mapper.
  # Kept pure so it is unit-testable without the gitignored source PDF.
  module TextMatch
    module_function

    # Accent-fold, downcase, strip punctuation, collapse runs of whitespace.
    def normalize(str)
      str.to_s
         .unicode_normalize(:nfd)
         .gsub(/\p{Mn}/, "")          # drop combining accent marks
         .downcase
         .gsub(/[^a-z0-9\s]/, " ")    # punctuation -> space
         .gsub(/\s+/, " ")
         .strip
    end

    # Classic iterative Levenshtein edit distance between two raw strings.
    def distance(a, b)
      a = a.to_s
      b = b.to_s
      return b.length if a.empty?
      return a.length if b.empty?

      prev = (0..b.length).to_a
      a.each_char.with_index(1) do |ca, i|
        curr = [i]
        b.each_char.with_index(1) do |cb, j|
          cost = ca == cb ? 0 : 1
          curr << [prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost].min
        end
        prev = curr
      end
      prev.last
    end

    # True iff the two strings are within `threshold` edits after normalization.
    def within?(a, b, threshold)
      distance(normalize(a), normalize(b)) <= threshold
    end
  end
end
