// Shared codec + geometry for the per-buyer pixel fingerprint watermark.
// Pure functions only — no pdf-lib, no image I/O — so both the pdf-lib
// encoder (stamp-manual-pdf.ts) and the pngjs decoder (decode-watermark.ts)
// import this single source of truth for bit layout and CRC.

export const COLS = 16
export const ROWS = 24
export const PAIRS_PER_ROW = COLS / 2 // 8
export const CAL_ROWS_TOP = 2
export const CAL_ROWS_BOTTOM = 2
export const PAYLOAD_ROW_START = CAL_ROWS_TOP // 2
export const PAYLOAD_ROW_END = ROWS - CAL_ROWS_BOTTOM // 22 (exclusive)
export const PAYLOAD_BITS = 40 // 32-bit code + 8-bit CRC
export const CONTENT_MARGIN_FRACTION = 0.04
export const AMPLITUDE_PAYLOAD = 0.03
export const AMPLITUDE_CALIBRATION = 0.05

// Fixed pattern (not secret, not per-user) carried by the 4 calibration rows.
// Used purely to detect sign inversion (e.g. a negative/inverted rescan).
export const CALIBRATION_BITS: number[] = Array.from(
  { length: (CAL_ROWS_TOP + CAL_ROWS_BOTTOM) * PAIRS_PER_ROW },
  (_, i) => i % 2,
)

type Section = "cal-top" | "payload" | "cal-bottom"

export type FrameSlot = { row: number; pairCol: number; section: Section; sectionIndex: number }

// The canonical iteration order for all 192 pair-slots on a page. Both the
// encoder (assigning bits) and the decoder (sampling pixels) MUST walk this
// same order, which is why it is a single exported function.
export function frameLayout(): FrameSlot[] {
  const slots: FrameSlot[] = []

  let idx = 0
  for (let row = 0; row < CAL_ROWS_TOP; row++) {
    for (let pairCol = 0; pairCol < PAIRS_PER_ROW; pairCol++) {
      slots.push({ row, pairCol, section: "cal-top", sectionIndex: idx++ })
    }
  }

  idx = 0
  for (let row = PAYLOAD_ROW_START; row < PAYLOAD_ROW_END; row++) {
    for (let pairCol = 0; pairCol < PAIRS_PER_ROW; pairCol++) {
      slots.push({ row, pairCol, section: "payload", sectionIndex: idx++ })
    }
  }

  idx = 0
  for (let row = ROWS - CAL_ROWS_BOTTOM; row < ROWS; row++) {
    for (let pairCol = 0; pairCol < PAIRS_PER_ROW; pairCol++) {
      slots.push({ row, pairCol, section: "cal-bottom", sectionIndex: idx++ })
    }
  }

  return slots // length 192
}

export function pairColumns(pairCol: number): { colA: number; colB: number } {
  const colA = pairCol * 2
  return { colA, colB: colA + 1 }
}

// Fraction of the page's content box (already inset by CONTENT_MARGIN_FRACTION
// on all sides), top-down (row 0 = top), left-to-right (col 0 = left). Callers
// convert to PDF points (flipping Y, since PDF origin is bottom-left) or to
// raster pixel coordinates (no flip needed, PNG rows are already top-down).
export function cellFraction(col: number, row: number): { x: number; y: number; width: number; height: number } {
  const boxX = CONTENT_MARGIN_FRACTION
  const boxY = CONTENT_MARGIN_FRACTION
  const boxW = 1 - 2 * CONTENT_MARGIN_FRACTION
  const boxH = 1 - 2 * CONTENT_MARGIN_FRACTION
  const cellW = boxW / COLS
  const cellH = boxH / ROWS
  return { x: boxX + col * cellW, y: boxY + row * cellH, width: cellW, height: cellH }
}

function crc8(bytes: number[]): number {
  let crc = 0
  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff
    }
  }
  return crc
}

function codeBytes(code: number): number[] {
  return [ (code >>> 24) & 0xff, (code >>> 16) & 0xff, (code >>> 8) & 0xff, code & 0xff ]
}

function codeToBits(code: number): number[] {
  const bits: number[] = []
  for (let i = 31; i >= 0; i--) bits.push((code >>> i) & 1)
  return bits
}

function bitsToCode(bits: number[]): number {
  let code = 0
  for (const bit of bits) code = (code * 2 + bit) >>> 0
  return code
}

function payloadBits(code: number): number[] {
  const bits = codeToBits(code) // 32
  const crc = crc8(codeBytes(code))
  for (let i = 7; i >= 0; i--) bits.push((crc >>> i) & 1)
  return bits // 40
}

export type FrameSlotWithBit = FrameSlot & { bit: number; amplitude: number }

// Assigns a bit + draw amplitude to every one of the 192 slots for one page.
export function buildFrame(code: number): FrameSlotWithBit[] {
  const payload = payloadBits(code)

  return frameLayout().map((slot) => {
    if (slot.section === "payload") {
      return { ...slot, bit: payload[slot.sectionIndex % PAYLOAD_BITS], amplitude: AMPLITUDE_PAYLOAD }
    }
    const calOffset = slot.section === "cal-top" ? 0 : CAL_ROWS_TOP * PAIRS_PER_ROW
    return { ...slot, bit: CALIBRATION_BITS[calOffset + slot.sectionIndex], amplitude: AMPLITUDE_CALIBRATION }
  })
}

export type DecodedFrame = { code: number; confidence: number; crcValid: boolean }

// pairLuma[i] corresponds to frameLayout()[i] — same order, same length (192).
export function decodeFrame(pairLuma: { a: number; b: number }[]): DecodedFrame | null {
  const layout = frameLayout()
  if (pairLuma.length !== layout.length) {
    throw new Error(`expected ${layout.length} luminance samples, got ${pairLuma.length}`)
  }

  let calAgree = 0
  let calTotal = 0
  layout.forEach((slot, i) => {
    if (slot.section === "payload") return
    const calOffset = slot.section === "cal-top" ? 0 : CAL_ROWS_TOP * PAIRS_PER_ROW
    const expected = CALIBRATION_BITS[calOffset + slot.sectionIndex]
    const observed = pairLuma[i].b > pairLuma[i].a ? 1 : 0
    if (observed === expected) calAgree++
    calTotal++
  })
  if (calTotal === 0) return null
  const inverted = calAgree / calTotal < 0.5

  const votes = Array.from({ length: PAYLOAD_BITS }, () => ({ ones: 0, total: 0, weight: 0 }))
  layout.forEach((slot, i) => {
    if (slot.section !== "payload") return
    const bitPos = slot.sectionIndex % PAYLOAD_BITS
    const diff = pairLuma[i].b - pairLuma[i].a
    let observed = diff > 0 ? 1 : 0
    if (inverted) observed = 1 - observed
    votes[bitPos].total++
    votes[bitPos].ones += observed
    votes[bitPos].weight += Math.abs(diff)
  })

  const bits = votes.map((v) => (v.total > 0 && v.ones >= v.total / 2 ? 1 : 0))
  const totalWeight = votes.reduce((sum, v) => sum + v.weight, 0)
  const totalSamples = votes.reduce((sum, v) => sum + v.total, 0)
  const confidence = totalSamples > 0 ? totalWeight / totalSamples : 0

  const code = bitsToCode(bits.slice(0, 32))
  const crc = bits.slice(32, 40).reduce((acc, b) => acc * 2 + b, 0)
  const crcValid = crc === crc8(codeBytes(code))

  return { code, confidence, crcValid }
}
