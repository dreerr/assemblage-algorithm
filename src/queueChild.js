import { processUrl } from './assemblage/assemblage.js'
import path from 'path';
import fs from 'fs';

const url = process.argv[2]
const hash = process.argv[3]
const other_info = process.argv[4]

// TODO: evaluate argv

processUrl(url).then((item) => {
  const exportPath = `./export_cp/${path.basename(url)}.svg`
  fs.writeFileSync(exportPath, item.rearranged)
})