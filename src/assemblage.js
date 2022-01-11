import canvas from 'canvas'
import fs from 'fs'
import path from 'path'
import { quantization } from './quantization.js'
import { vectorization, canvasFromImageData } from './vectorization.js'
import { rearrange } from './rearranging.js'
import { logger } from './logger.js'
const { loadImage, createCanvas } = canvas

const maxSize = 1000

export const processUrl = async (url, opts = {}) => {
  const basenameNoExt = path.basename(url).replace(/\.[^/.]+$/, '')
  logger.profile(basenameNoExt + ' TOTAL')

  // LOAD AND SCALE IMAGE
  logger.profile(basenameNoExt + ' Scaling')
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
  logger.profile(basenameNoExt + ' Scaling')

  // 1: reduce colors of image
  logger.profile(basenameNoExt + ' Reducing')
  const imageDataReduced = await quantization(imageData)
  logger.profile(basenameNoExt + ' Reducing')

  // 2: vectorize image
  logger.profile(basenameNoExt + ' Vectorizing')
  const svgVectorized = await vectorization(imageDataReduced)
  logger.profile(basenameNoExt + ' Vectorizing')

  // 3: rearrange the vectorized data
  logger.profile(basenameNoExt + ' Rearranging')
  const svgRearranged = await rearrange(svgVectorized)
  logger.profile(basenameNoExt + ' Rearranging')

  logger.profile(basenameNoExt + ' TOTAL')

  if (opts.debug) {
    const debugPath = opts.debug
    const reduced = fs.createWriteStream(path.join(debugPath, basenameNoExt + 'A_reduced.png'))
    const stream = canvasFromImageData(imageDataReduced).createPNGStream()
    stream.pipe(reduced)
    fs.writeFileSync(path.join(debugPath, basenameNoExt + 'B_vectorized.svg'), svgVectorized.svg)
    fs.writeFileSync(path.join(debugPath, basenameNoExt + 'C_rearranged.svg'), svgRearranged)
  }
  return {
    resized: imageData,
    reduced: imageDataReduced,
    vectorized: svgVectorized,
    rearranged: svgRearranged
  }
}
