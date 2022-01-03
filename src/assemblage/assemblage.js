import { quantization } from './quantization.js'
import { vectorization, canvasFromImageData } from './vectorization.js'
import { rearrange } from './rearranging.js'
import canvas from 'canvas'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
const { loadImage, createCanvas } = canvas
dotenv.config()

const maxSize = 1000

export const processUrl = async (url, opts = {}) => {
  const basenameNoExt = path.basename(url).replace(/\.[^/.]+$/, '')
  console.time(basenameNoExt + ' TOTAL')

  // LOAD AND SCALE IMAGE
  console.time(basenameNoExt + ' Scaling')
  const img = await loadImage(url)
  let w = img.width
  let h = img.height
  if (w > maxSize && w >= h) {
    h *= maxSize / w
    w = maxSize
  } else if (h > maxSize) {
    w *= maxSize / h
    h = maxSize
  }
  const canvas = createCanvas(w, h)
  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = false
  context.drawImage(img, 0, 0, w, h)
  const imageData = context.getImageData(0, 0, w, h)
  console.timeEnd(basenameNoExt + ' Scaling')

  // 1: reduce colors of image
  console.time(basenameNoExt + ' Reducing')
  const imageDataReduced = await quantization(imageData)
  console.timeEnd(basenameNoExt + ' Reducing')

  // 2: vectorize image
  console.time(basenameNoExt + ' Vectorizing')
  const svgVectorized = await vectorization(imageDataReduced)
  console.timeEnd(basenameNoExt + ' Vectorizing')

  // 3: rearrange the vectorized data
  console.time(basenameNoExt + ' Rearranging')
  const svgRearranged = await rearrange(svgVectorized)
  console.timeEnd(basenameNoExt + ' Rearranging')

  console.timeEnd(basenameNoExt + ' TOTAL')
  console.log('-------------------------')

  if (process.env.DEBUG === '1') {
    const debugFolder = process.env.DEBUG_PATH
    const reduced = fs.createWriteStream(path.join(debugFolder, basenameNoExt + 'A_reduced.png'))
    const stream = canvasFromImageData(imageDataReduced).createPNGStream()
    stream.pipe(reduced)
    fs.writeFileSync(path.join(debugFolder, basenameNoExt + 'B_vectorized.svg'), svgVectorized.svg)
    fs.writeFileSync(path.join(debugFolder, basenameNoExt + 'C_rearranged.svg'), svgRearranged)
  }
  return {
    resized: imageData,
    reduced: imageDataReduced,
    vectorized: svgVectorized,
    rearranged: svgRearranged
  }
}
