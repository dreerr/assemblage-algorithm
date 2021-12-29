import glob from 'glob'
import { processUrl } from './assemblage/assemblage.js'
import path from 'path'
import fs from 'fs'
import natsort from 'natsort';

import PQueue from 'p-queue'

const queue = new PQueue({ concurrency: 8 })

let count = 0
queue.on('active', () => {
  console.log(`Working on item #${++count}.  Size: ${queue.size}  Pending: ${queue.pending}`)
})

const main = async () => {
  const items = glob.sync('../../Beispielbilder/*')
  items.sort(natsort.default())
  // console.time('total')
  // const items = ['../../Beispielbilder/Example 83.png']
  // const items = ['https://media.artblocks.io/13000757.png']
  // for (const item of items) {
  //   const assemblage = await processUrl(item)
  //   const exportPath = `./export/${path.basename(item)}.svg`
  //   fs.writeFileSync(exportPath, assemblage.rearranged)
  // }
  await queue.add(() => console.time('total'));
  for (const item of items) {
    queue.add(async () => {
      const assemblage = await processUrl(item)
      const exportPath = `./export/${path.basename(item)}.svg`
      fs.writeFileSync(exportPath, assemblage.rearranged)
    });
  }
  await queue.add(() => {
    console.log('num items', items.length)
    console.timeEnd('total')
  });
}

main()
