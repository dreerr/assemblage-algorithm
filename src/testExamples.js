import glob from 'glob'
import natsort from 'natsort'
import { addToQueue } from './queue.js'
import path from 'path'
import { writeFileSync } from 'fs'

const items = glob.sync('../../Beispielbilder/*')
items.sort(natsort.default())
items.forEach(addToQueue)

const snip = items.map(el => `<img src="./${path.basename(el)}.svg">`).join('\n')
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    img { width: 100%; height: auto; margin: 3em 2em}
  </style>
</head>
<body>
${snip}
</body>
</html>`
writeFileSync(`${process.env.EXPORT_PATH}index.html`, html)
