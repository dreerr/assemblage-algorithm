import canvas from "canvas"
import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { fileURLToPath } from "url"
import { quantization } from "./quantization.js"
import { vectorization, canvasFromImageData } from "./vectorization.js"
import { rearrange } from "./rearranging.js"
import { logger } from "./logger.js"
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const { loadImage, createCanvas } = canvas

const maxSize = 1000

export const assemblage = async (source, target, opts = {}) => {
  logger.debug(`🖼 Processing ${source}`)
  logger.profile("TOTAL")
  const data = {}

  // 1. LOAD AND SCALE IMAGE
  logger.profile("Scaling")
  data.resized = await scaling(source)
  logger.profile("Scaling", { level: "debug" })

  // 2. REDUCE COLORS OF IMAGE
  logger.profile("Reducing")
  data.reduced = await quantization(data.resized)
  logger.profile("Reducing", { level: "debug" })

  // 3. VECTORIZE IMAGE
  logger.profile("Vectorizing")
  data.vectorized = await vectorization(data.reduced)
  logger.profile("Vectorizing", { level: "debug" })

  // 4. REARRANGE THE VECTORIZED DATA
  logger.profile("Rearranging")
  data.rearranged = await rearrange({
    ...data.vectorized,
    ...opts,
  })
  fs.writeFileSync(target, data.rearranged)
  logger.profile("Rearranging", { level: "debug" })

  // 5. RENDER PNG REPRESENTATION
  logger.profile("Rendering")
  data.rendered = await rendering(target, opts)
  logger.profile("Rendering", { level: "debug" })

  // 6. OPTIONAL DEBUGGING
  if (opts.debug !== undefined) {
    logger.profile("Debugging")
    await debugging(data, opts.debug, source)
    logger.profile("Debugging", { level: "debug" })
  }

  logger.profile("TOTAL", { level: "debug" })
  return data
}

const scaling = async (path) => {
  const isSvg = path.toLowerCase().endsWith(".svg")
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
  context.imageSmoothingEnabled = false
  context.drawImage(img, 0, 0, w, h)
  return context.getImageData(0, 0, w, h)
}

const rendering = (target, opts) =>
  new Promise((resolve, reject) => {
    const targetRender = target.replace(/\.[^/.]+$/, "") + ".png"
    const resvg = `${__dirname}/../lib/resvg_${process.platform}`
    if (!fs.existsSync(resvg)) reject(Error("resvg binary not found"))
    const renderSize = opts.renderSize || 2000
    exec(
      `"${resvg}" "${target}" "${targetRender}" -w ${renderSize}`,
      (error) => {
        if (error !== null) {
          logger.error(`resvg error: ${error}`)
          reject(error)
        } else {
          resolve(targetRender)
        }
      }
    )
  })

const debugging = (data, debugPath, source) => {
  const basenameNoExt = path.basename(source).replace(/\.[^/.]+$/, "")
  const scaled = fs.createWriteStream(
    path.join(debugPath, basenameNoExt + "A_scaled.png")
  )
  const scaledStream = canvasFromImageData(data.resized).createPNGStream()
  scaledStream.pipe(scaled)
  const reduced = fs.createWriteStream(
    path.join(debugPath, basenameNoExt + "B_reduced.png")
  )
  const reducedStream = canvasFromImageData(data.reduced).createPNGStream()
  reducedStream.pipe(reduced)
  fs.writeFileSync(
    path.join(debugPath, basenameNoExt + "C_vectorized.svg"),
    data.vectorized.svg
  )
  fs.writeFileSync(
    path.join(debugPath, basenameNoExt + "D_rearranged.svg"),
    data.rearranged
  )
}
