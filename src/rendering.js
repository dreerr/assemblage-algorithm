import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { fileURLToPath } from "url"
import { logger } from "./logger.js"
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const rendering = (target, opts) =>
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
