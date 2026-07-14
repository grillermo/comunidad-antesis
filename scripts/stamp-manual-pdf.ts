import { readFile } from "node:fs/promises"
import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib"

// Page 2 of data/manual.pdf: 396.85 x 612.283 pt, author name centered,
// baseline ~57pt from bottom. Stamp goes directly below it.
const STAMP_PAGE_INDEX = 1
const FONT_SIZE = 7
const BASELINE_Y = 46
const AUTHOR_BLUE = rgb(0.23, 0.42, 0.65)

async function main() {
  const [sourcePath, email] = process.argv.slice(2)
  if (!sourcePath || !email) {
    console.error("usage: stamp-manual-pdf.ts <source-pdf-path> <email>")
    process.exit(1)
  }

  const doc = await PDFDocument.load(await readFile(sourcePath))
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const page = doc.getPage(STAMP_PAGE_INDEX)

  const text = `copia de ${email}`
  const textWidth = font.widthOfTextAtSize(text, FONT_SIZE)
  page.drawText(text, {
    x: (page.getWidth() - textWidth) / 2,
    y: BASELINE_Y,
    size: FONT_SIZE,
    font,
    color: AUTHOR_BLUE,
  })

  process.stdout.write(await doc.save())
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
