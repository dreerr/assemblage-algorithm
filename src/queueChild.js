import { processUrl } from './assemblage.js'
import { exec } from 'child_process'
import fs from 'fs'
import { exit } from 'process'
import { logger } from './logger.js';

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
  exec(`./bin/resvg "${targetFile}" "${targetFile}.png" -w 2000`,
    (error) => {
      if (error !== null) {
        logger.error(`resvg error: ${error}`)
        exit(1)
      }
    })
})
