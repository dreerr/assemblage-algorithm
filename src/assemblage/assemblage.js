import { quantization } from './quantization.js'
import { vectorization, canvasFromImageData } from './vectorization.js'
import { rearrange } from './rearranging.js'
import pkg from 'canvas'
import fs from 'fs'
import path from 'path'
const { loadImage, createCanvas } = pkg

const maxSize = 1000

export const processUrl = async (url, opts = {}) => {
  const basenameNoExt = path.basename(url).replace(/\.[^/.]+$/, '')
  console.time(basenameNoExt)

  // LOAD AND SCALE IMAGE
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

  // 1: reduce colors of image
  const imageDataReduced = await quantization(imageData)

  // 2: vectorize image
  const svgVectorized = await vectorization(imageDataReduced)

  // 3: rearrange the vectorized data
  const svgRearranged = await rearrange(svgVectorized)

  console.timeEnd(basenameNoExt)
  if (opts.debug) {
    const reduced = fs.createWriteStream(path.join(opts.debug, basenameNoExt + '_reduced.png'))
    const stream = canvasFromImageData(imageDataReduced).createPNGStream()
    stream.pipe(reduced)
    fs.writeFile(
      path.join(opts.debug, basenameNoExt + '_vectrorized.svg'),
      svgVectorized.svg, () => { })
    fs.writeFile(
      path.join(opts.debug, basenameNoExt + '_rearranged.svg'),
      svgRearranged, () => { })
  }
  return {
    resized: imageData,
    reduced: imageDataReduced,
    vectorized: svgVectorized,
    rearranged: svgRearranged
  }
}
