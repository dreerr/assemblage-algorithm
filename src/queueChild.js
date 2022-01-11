import { processUrl } from './assemblage.js'
import { exec } from 'child_process'
import fs from 'fs'
import { exit } from 'process'
import { logger } from './logger.js'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const sourceFile = process.argv[2]
const targetFile = process.argv[3]
const opts = ((raw) => {
  try {
    return JSON.parse(raw)
  } catch (err) {
    return {}
  }
})(process.argv[4])

if (sourceFile === '' || targetFile === '') exit(1)

processUrl(sourceFile, opts).then((item) => {
  fs.writeFileSync(targetFile, item.rearranged)
  const targetFileRender = targetFile.replace(/\.[^/.]+$/, '') + '.png'
  exec(`"${__dirname}/../bin/resvg" "${targetFile}" "${targetFileRender}" -w 2000`,
    (error) => {
      if (error !== null) {
        logger.error(`resvg error: ${error}`)
        exit(1)
      }
    })
})
