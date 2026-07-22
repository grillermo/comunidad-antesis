// Pure codec round-trip check, no PDF/image I/O. Run via:
//   node_modules/.bin/tsx scripts/watermark-selftest.ts <code>
// Exits 0 and prints {ok:true,...} on success, exits 1 otherwise. Exists so
// RSpec (the only test runner in this repo) can assert on the codec without
// a JS test framework.
import { buildFrame, decodeFrame } from "./lib/watermark.ts"

const code = Number(process.argv[2])
if (!Number.isInteger(code) || code < 1 || code > 2 ** 32 - 1) {
  console.error("usage: watermark-selftest.ts <uint32 code>")
  process.exit(1)
}

const frame = buildFrame(code)
const pairLuma = frame.map((slot) => {
  const base = 180
  const delta = slot.amplitude * 255
  return slot.bit === 1 ? { a: base - delta, b: base + delta } : { a: base + delta, b: base - delta }
})

const result = decodeFrame(pairLuma)
if (!result || !result.crcValid || result.code !== code) {
  console.error(JSON.stringify({ ok: false, result, expected: code }))
  process.exit(1)
}

console.log(JSON.stringify({ ok: true, code: result.code, confidence: result.confidence }))
