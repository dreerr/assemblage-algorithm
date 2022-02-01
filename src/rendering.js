import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { fileURLToPath } from "url"
import { logger } from "./logger.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resvg = `${__dirname}/../lib/resvg_${process.platform}`
if (!fs.existsSync(resvg)) {
  throw new Error("resvg binary not found")
}

export const rendering = (target, opts) =>
  new Promise((resolve, reject) => {
    const targetRender = target.replace(/\.[^.]+$/, "") + ".png"
    const renderSize = opts.renderSize || 2000
    const background = opts.backgroundColor
      ? `--background "${opts.backgroundColor}"`
      : ""
    exec(
      `"${resvg}" "${target}" "${targetRender}" -w ${renderSize} ${background}`,
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
