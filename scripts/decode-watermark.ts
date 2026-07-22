// Decodes the pixel fingerprint watermark from a single rasterized page.
// Input: path to a PNG that IS the full page (no crop/rotate handling — see
// docs/superpowers/specs/2026-07-20-pdf-fingerprint-design.md "Out of scope").
// Output: one line of JSON on stdout: {code, confidence, crcValid}.
import { readFileSync } from "node:fs"
import { PNG } from "pngjs"
import { cellFraction, decodeFrame, frameLayout, pairColumns } from "./lib/watermark.ts"

const [imagePath] = process.argv.slice(2)
if (!imagePath) {
  console.error("usage: decode-watermark.ts <page.png>")
  process.exit(1)
}

const png = PNG.sync.read(readFileSync(imagePath))

function centerFraction(col: number, row: number): { x: number; y: number } {
  const c = cellFraction(col, row)
  return { x: c.x + c.width / 2, y: c.y + c.height / 2 }
}

function luminanceAt(xFrac: number, yFrac: number): number {
  const x = Math.min(png.width - 1, Math.max(0, Math.round(xFrac * png.width)))
  const y = Math.min(png.height - 1, Math.max(0, Math.round(yFrac * png.height)))
  const idx = (png.width * y + x) << 2
  const r = png.data[idx]
  const g = png.data[idx + 1]
  const b = png.data[idx + 2]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const pairLuma = frameLayout().map((slot) => {
  const { colA, colB } = pairColumns(slot.pairCol)
  const a = centerFraction(colA, slot.row)
  const b = centerFraction(colB, slot.row)
  return { a: luminanceAt(a.x, a.y), b: luminanceAt(b.x, b.y) }
})

const result = decodeFrame(pairLuma)
process.stdout.write(JSON.stringify(result ?? { code: null, confidence: 0, crcValid: false }))
