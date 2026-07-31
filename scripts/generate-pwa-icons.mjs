// One-off generator, not part of the build. Re-run manually
// (`node scripts/generate-pwa-icons.mjs`) if public/pwa-icon.svg changes.
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const publicDir = path.join(rootDir, 'public')
const sourceSvg = path.join(publicDir, 'pwa-icon.svg')

const NAVY = { r: 0x11, g: 0x18, b: 0x27, alpha: 1 }

async function renderSquare(size, outFile) {
  await sharp(sourceSvg).resize(size, size).png().toFile(path.join(publicDir, outFile))
}

async function renderMaskable(canvasSize, outFile) {
  // Maskable icons get platform-applied circle/squircle masks, so the mark
  // needs extra padding to stay inside the safe zone — shrink it onto a
  // full-bleed navy canvas instead of rendering edge-to-edge.
  const markSize = Math.round(canvasSize * 0.65)
  const mark = await sharp(sourceSvg).resize(markSize, markSize).png().toBuffer()
  await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: NAVY },
  })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, outFile))
}

await renderSquare(192, 'pwa-192x192.png')
await renderSquare(512, 'pwa-512x512.png')
await renderMaskable(512, 'pwa-maskable-512x512.png')
await renderSquare(180, 'apple-touch-icon.png')

console.log('Generated PWA icons in public/')
