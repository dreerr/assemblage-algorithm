import fs from "fs"
import { exec } from "child_process"
import { exit } from "process"
import { dirname } from "path"
import { fileURLToPath } from "url"
import { processUrl } from "./assemblage.js"
import { logger } from "./logger.js"
const __dirname = dirname(fileURLToPath(import.meta.url))

const sourceFile = process.argv[2]
const targetFile = process.argv[3]
const opts = ((raw) => {
  try {
    return JSON.parse(raw)
  } catch (err) {
    return {}
  }
})(process.argv[4])

if (sourceFile === "" || targetFile === "") exit(1)

logger.profile("TOTAL")
processUrl(sourceFile, opts).then((item) => {
  fs.writeFileSync(targetFile, item.rearranged)
  logger.profile("Rendering")
  const targetFileRender = targetFile.replace(/\.[^/.]+$/, "") + ".png"
  const resvg = `${__dirname}/../bin/resvg_${process.platform}`
  if (!fs.existsSync(resvg)) exit(1)
  const renderSize = opts.renderSize || 2000
  exec(`"${resvg}" "${targetFile}" "${targetFileRender}" -w ${renderSize}`, (error) => {
    if (error !== null) {
      logger.error(`resvg error: ${error}`)
      exit(1)
    } else {
      logger.profile("Rendering", { level: "debug" })
      logger.profile("TOTAL", { level: "debug" })
    }
  })
})
