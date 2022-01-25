import fs from "fs"
import { scaling } from "./scaling.js"
import { quantization } from "./quantization.js"
import { vectorization } from "./vectorization.js"
import { rearrange } from "./rearranging.js"
import { rendering } from "./rendering.js"
import { comparing } from "./comparing.js"
import { debugging } from "./debugging.js"
import { logger } from "./logger.js"

export const assemblage = async (source, target, opts = {}) => {
  logger.debug(`🖼 Processing ${source}`)
  logger.profile("TOTAL")
  const data = {}

  // 1. LOAD AND SCALE IMAGE
  logger.profile("Scaling")
  data.resized = await scaling(source, opts)
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

  // 6. MAKE SCREENSHOT PNG
  logger.profile("Comparing")
  data.compared = await comparing(source, target)
  logger.profile("Comparing", { level: "debug" })

  // OPTIONAL DEBUGGING
  if (opts.debug !== undefined) {
    logger.profile("Debugging")
    await debugging(data, opts.debug, source)
    logger.profile("Debugging", { level: "debug" })
  }

  logger.profile("TOTAL", { level: "debug" })
  return data
}
