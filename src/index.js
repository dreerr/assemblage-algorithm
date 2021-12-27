import glob from 'glob'
import { processUrl } from './assemblage/assemblage.js'
import path from 'path'
import fs from 'fs'

const main = async () => {
  console.time('total')
  // const items = glob.sync('../../Beispielbilder/*')
  // items.sort()
  const items = ['https://media.artblocks.io/13000757.png']
  for (const item of items) {
    const assemblage = await processUrl(item)
    const exportPath = `./export/${path.basename(item)}.svg`
    fs.writeFileSync(exportPath, assemblage.rearranged)
  }
  console.log('num items', items.length)
  console.timeEnd('total')
}

main()
