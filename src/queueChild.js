import { processUrl } from './assemblage/assemblage.js'
import path from 'path'
import fs from 'fs'

const url = process.argv[2]
// const hash = process.argv[3]
// const otherInfo = process.argv[4]

// TODO: evaluate argv

processUrl(url).then((item) => {
  const exportPath = path.join(process.env.EXPORT_PATH, `${path.basename(url)}.svg`)
  fs.writeFileSync(exportPath, item.rearranged)
})
