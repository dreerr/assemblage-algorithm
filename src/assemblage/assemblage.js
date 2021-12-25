import axios from 'axios'
import { Buffer } from 'buffer'
import { quantization } from './quantization.js'
import { vectorization } from './vectorization.js'
import { rearrange } from './rearranging.js'
import pkg from 'canvas';
const { loadImage, createCanvas } = pkg;

// TODO Fail!
const getBase64 = async (url) => {
  try {
    const image = await axios.get(url, { responseType: 'arraybuffer' })
    const raw = Buffer.from(image.data).toString('base64')
    return 'data:' + image.headers['content-type'] + ';base64,' + raw
  } catch (error) {
    console.log(error)
    return null
  }
}

export const processUrl = async (url, opts = {}) => {
  let img = await loadImage(url);

  const object = await processImg(img, opts)
  return object
}

const processImg = async (img, opts = {}) => {
  // TODO: honor metadata field 'background_color'
  const maxSize = 1000
  let w = img.width
  let h = img.height
  if (w > maxSize && w >= h) {
    h *= maxSize / w
    w = maxSize
  } else if (h > maxSize) {
    w *= maxSize / h
    h = maxSize
  }
  console.log('image is now', w, h)
  const canvas = createCanvas(w, h);
  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = false;
  context.drawImage(img, 0, 0, w, h)
  const imageData = context.getImageData(0, 0, w, h)
  if (opts.debug) opts.debug.append(canvas)

  const object = await processImageData(imageData, opts)
  return object
}

export const processImageData = async (imageData, opts = {}) => {
  const id = Math.floor(Math.random() * 1000)
  console.time(id)
  // 1: reduce colors of image
  const imageDataReduced = await quantization(imageData)
  if (opts.debug) opts.debug.append(canvasFromImageData(imageDataReduced))

  // 2: vectorize image
  const svgVectorized = await vectorization(imageDataReduced)
  if (opts.debug) opts.debug.append(nodeFromSvg(svgVectorized))

  // 3: rearrange the vectorized data
  const svgRearranged = await rearrange(svgVectorized, opts)
  if (opts.debug) opts.debug.append(nodeFromSvg(svgRearranged))
  console.timeEnd(id)
  return {
    resized: imageData,
    reduced: imageDataReduced,
    vectorized: svgVectorized,
    rearranged: svgRearranged
  }
}

// Helper Functions for Debug
const canvasFromImageData = (imageData) => {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

const nodeFromSvg = (svg) => {
  const span = document.createElement('span')
  span.innerHTML = svg
  return span
}
