import { execFileSync } from "node:child_process"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  TextRenderingMode,
  rgb,
} from "@cantoo/pdf-lib"
import { buildFrame, cellFraction, pairColumns } from "./lib/watermark.ts"

// Page 2 of data/manual.pdf: 396.85 x 612.283 pt, author name centered,
// baseline ~57pt from bottom. Stamp goes directly below it.
const STAMP_PAGE_INDEX = 1
const FONT_SIZE = 7
const BASELINE_Y = 46
const AUTHOR_BLUE = rgb(0.23, 0.42, 0.65)

// How many consecutive PDF text lines we try to concatenate when matching a
// heading, so that headings wrapped onto several lines still resolve.
const MAX_JOIN = 4

// The "Contenido" table of contents (PDF pages 4-7, 1-indexed) already carries
// internal links that jump to each section's page. We leave those alone rather
// than covering them with web links, so the index stays a within-PDF index.
const CONTENIDO_FIRST_PAGE = 4
const CONTENIDO_LAST_PAGE = 7

// A hidden email watermark at the bottom-left of every page except the first
// two (cover + author). Drawn in the "Invisible" text rendering mode: the glyphs
// are never painted, so it is visually absent on any background (including the
// textured chapter openers), yet stays selectable/copyable for leak tracing.
const HIDDEN_FONT_SIZE = 7
const HIDDEN_MARGIN_X = 14
const HIDDEN_BASELINE_Y = 8

type LinkTarget = { title: string; url: string }
type TextItem = { top: number; left: number; width: number; height: number; text: string }
type Box = { left: number; top: number; right: number; bottom: number }
type Match = { pageNumber: number; box: Box; url: string }
type StdinPayload = { targets: LinkTarget[]; fingerprintCode?: number }

// Normalize heading text so PDF glyph runs and TOC titles compare equal:
// decode entities, drop inline markup, fold whitespace, lowercase.
function normalize(raw: string): string {
  return decodeEntities(raw.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    // Part headings carry a roman/arabic enumerator ("IV. Color en movimiento")
    // absent from the TOC title; drop a leading enumerator so they still match.
    .replace(/^(?:[ivxlcdm]+|\d+)\.\s+/, "")
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
}

// Extract pdftohtml's XML into per-page pixel geometry. pdftohtml renders at a
// fixed zoom, so each page reports its own width/height that we scale back to
// PDF points against the real page size.
function parsePages(xml: string): Map<number, { width: number; height: number; items: TextItem[] }> {
  const pages = new Map<number, { width: number; height: number; items: TextItem[] }>()
  const pageRe =
    /<page number="(\d+)"[^>]*height="([\d.]+)"[^>]*width="([\d.]+)"[^>]*>([\s\S]*?)<\/page>/g
  const textRe =
    /<text top="(-?[\d.]+)" left="(-?[\d.]+)" width="(-?[\d.]+)" height="(-?[\d.]+)"[^>]*>([\s\S]*?)<\/text>/g

  for (const page of xml.matchAll(pageRe)) {
    const number = parseInt(page[1], 10)
    const height = parseFloat(page[2])
    const width = parseFloat(page[3])
    const items: TextItem[] = []
    for (const t of page[4].matchAll(textRe)) {
      items.push({
        top: parseFloat(t[1]),
        left: parseFloat(t[2]),
        width: parseFloat(t[3]),
        height: parseFloat(t[4]),
        text: normalize(t[5]),
      })
    }
    pages.set(number, { width, height, items })
  }
  return pages
}

function extend(box: Box | null, item: TextItem): Box {
  const right = item.left + item.width
  const bottom = item.top + item.height
  if (!box) return { left: item.left, top: item.top, right, bottom }
  return {
    left: Math.min(box.left, item.left),
    top: Math.min(box.top, item.top),
    right: Math.max(box.right, right),
    bottom: Math.max(box.bottom, bottom),
  }
}

// Find every place a TOC title appears as a heading. A heading may be one text
// line or several wrapped lines, so we greedily join up to MAX_JOIN consecutive
// lines and accept the span the moment it equals a known title.
function findMatches(
  pages: ReturnType<typeof parsePages>,
  titles: Map<string, string>,
): Match[] {
  const matches: Match[] = []
  for (const [pageNumber, page] of pages) {
    const { items } = page
    for (let i = 0; i < items.length; i++) {
      let acc = ""
      let box: Box | null = null
      for (let j = i; j < items.length && j < i + MAX_JOIN; j++) {
        if (items[j].text === "") continue
        acc = acc ? `${acc} ${items[j].text}` : items[j].text
        box = extend(box, items[j])
        const url = titles.get(acc)
        if (url) {
          matches.push({ pageNumber, box: box!, url })
          i = j
          break
        }
      }
    }
  }
  return matches
}

function runPdfToHtml(sourcePath: string): Promise<string> {
  return (async () => {
    const dir = await mkdtemp(join(tmpdir(), "manual-xml-"))
    const base = join(dir, "manual")
    try {
      execFileSync("pdftohtml", ["-xml", "-i", "-q", sourcePath, base], {
        stdio: ["ignore", "ignore", "inherit"],
      })
      return await readFile(`${base}.xml`, "utf8")
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })()
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    process.stdin.on("data", (c: Buffer) => chunks.push(c))
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    process.stdin.on("error", reject)
  })
}

function embedWatermark(page: import("@cantoo/pdf-lib").PDFPage, code: number) {
  const { width, height } = page.getSize()
  const darkColor = rgb(0, 0, 0)
  const lightColor = rgb(1, 1, 1)

  for (const slot of buildFrame(code)) {
    const { colA, colB } = pairColumns(slot.pairCol)
    const a = cellFraction(colA, slot.row)
    const b = cellFraction(colB, slot.row)
    const [aColor, bColor] = slot.bit === 1 ? [darkColor, lightColor] : [lightColor, darkColor]

    // cellFraction is top-down (row 0 = top); PDF points are bottom-up.
    page.drawRectangle({
      x: a.x * width,
      y: (1 - a.y - a.height) * height,
      width: a.width * width,
      height: a.height * height,
      color: aColor,
      opacity: slot.amplitude,
    })
    page.drawRectangle({
      x: b.x * width,
      y: (1 - b.y - b.height) * height,
      width: b.width * width,
      height: b.height * height,
      color: bColor,
      opacity: slot.amplitude,
    })
  }
}

async function main() {
  const [sourcePath, email] = process.argv.slice(2)
  if (!sourcePath || !email) {
    console.error("usage: stamp-manual-pdf.ts <source-pdf-path> <email>")
    process.exit(1)
  }

  const raw = await readStdin()
  const payload: StdinPayload = raw.trim() ? JSON.parse(raw) : { targets: [] }
  const targets = payload.targets ?? []
  const titles = new Map<string, string>()
  for (const t of targets) titles.set(normalize(t.title), t.url)

  const pages = parsePages(await runPdfToHtml(sourcePath))
  const matches = findMatches(pages, titles)

  const doc = await PDFDocument.load(await readFile(sourcePath))

  // Turn each matched heading into a link to its web page. pdftohtml page N maps
  // to PDF page index N-1; its pixel box scales back to PDF points, whose origin
  // is the bottom-left corner.
  for (const { pageNumber, box, url } of matches) {
    if (pageNumber >= CONTENIDO_FIRST_PAGE && pageNumber <= CONTENIDO_LAST_PAGE) continue

    const page = doc.getPage(pageNumber - 1)
    const geom = pages.get(pageNumber)!
    const scaleX = page.getWidth() / geom.width
    const scaleY = page.getHeight() / geom.height
    const rect = [
      box.left * scaleX,
      page.getHeight() - box.bottom * scaleY,
      box.right * scaleX,
      page.getHeight() - box.top * scaleY,
    ]
    const annot = doc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: rect,
      Border: [0, 0, 0],
      A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
    })
    const ref = doc.context.register(annot)
    const existing = page.node.lookup(PDFName.of("Annots"))
    if (existing instanceof PDFArray) {
      existing.push(ref)
    } else {
      page.node.set(PDFName.of("Annots"), doc.context.obj([ref]))
    }
  }

  const font = await doc.embedFont(StandardFonts.Helvetica)
  const stampPage = doc.getPage(STAMP_PAGE_INDEX)
  const text = `copia de ${email}`
  const textWidth = font.widthOfTextAtSize(text, FONT_SIZE)
  stampPage.drawText(text, {
    x: (stampPage.getWidth() - textWidth) / 2,
    y: BASELINE_Y,
    size: FONT_SIZE,
    font,
    color: AUTHOR_BLUE,
  })

  // Hidden per-page email watermark + pixel fingerprint on every page after
  // the first two.
  const allPages = doc.getPages()
  for (let i = STAMP_PAGE_INDEX + 1; i < allPages.length; i++) {
    allPages[i].drawText(text, {
      x: HIDDEN_MARGIN_X,
      y: HIDDEN_BASELINE_Y,
      size: HIDDEN_FONT_SIZE,
      font,
      renderMode: TextRenderingMode.Invisible,
    })
    if (payload.fingerprintCode) {
      embedWatermark(allPages[i], payload.fingerprintCode)
    }
  }

  process.stdout.write(await doc.save({ useObjectStreams: false }))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
