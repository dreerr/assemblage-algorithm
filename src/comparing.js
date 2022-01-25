import fs from "fs"
import canvas from "canvas"
const { loadImage, createCanvas } = canvas

const w = 1600
const h = 900

export const comparing = async (source, target) => {
  const basenameNoExt = target.replace(/\.[^/.]+$/, "")
  target = basenameNoExt + ".png"
  const sourceImage = await loadImage(source)
  const aspectRatio = sourceImage.width / sourceImage.height
  const targetImage = await loadImage(target)
  const canvas = createCanvas(w, h)
  const context = canvas.getContext("2d")
  context.fillStyle = "#FFFFFF"
  context.fillRect(0, 0, w, h)
  context.drawImage(sourceImage, 28, 28, 250, 250 / aspectRatio)
  context.drawImage(targetImage, 307, 28, 1265, 844)
  const comparison = fs.createWriteStream(basenameNoExt + "_comparison.png")
  const stream = canvas.createPNGStream()
  stream.pipe(comparison)
}
