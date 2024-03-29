import fs from "fs"
import canvas from "canvas"
import { rendering } from "./rendering.js"
import { logger } from "./logger.js"
const { loadImage, createCanvas } = canvas
const maxSize = 1000

export const scaling = async (path, opts) => {
  const isSvg = path.toLowerCase().endsWith(".svg")
  if (isSvg && opts.backgroundColor === undefined) {
    const svg = fs.readFileSync(path).toString()
    const match = svg.match(/<svg[^>]+background-color:\s*(.+?)[;'"]/)
    if (match) {
      opts.backgroundColor = match[1]
    }
  }
  if (opts.backgroundColor) {
    logger.debug(`Detected background-color '${opts.backgroundColor}'`)
  }
  if (isSvg) {
    path = await rendering(path, {
      renderSize: maxSize,
      backgroundColor: opts.backgroundColor,
    })
  }
  const img = await loadImage(path)
  let w = img.width
  let h = img.height
  if ((w > maxSize && w >= h) || isSvg) {
    h *= maxSize / w
    w = maxSize
  } else if (h > maxSize || isSvg) {
    w *= maxSize / h
    h = maxSize
  }
  const canvas = createCanvas(w, h)
  const context = canvas.getContext("2d")
  context.fillStyle = opts.backgroundColor || "#EEEEEE"
  context.fillRect(0, 0, w, h)
  context.imageSmoothingEnabled = false
  context.drawImage(img, 0, 0, w, h)
  return context.getImageData(0, 0, w, h)
}
