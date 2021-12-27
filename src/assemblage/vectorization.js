import pkg from 'canvas'
import { loadFromCanvas } from 'potrace-wasm'
const { createCanvas, createImageData } = pkg

export const vectorization = async (imageData) => {
  const params = {
    turdsize: 2,
    turnpolicy: 4,
    alphamax: 1,
    opticurve: 1,
    opttolerance: 0.2,
    pathonly: false,
    strokeWidth: 10,
    minPathSegments: 10
  }
  const obj = await convertToColorSVG(imageData, params)
  return obj
}

export const canvasFromImageData = (imageData) => {
  const canvas = createCanvas(imageData.width, imageData.height)
  const context = canvas.getContext('2d')
  context.putImageData(imageData, 0, 0)
  return canvas
}

const extractColors = (imageData) => {
  const colors = {}
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i]
    const g = imageData.data[i + 1]
    const b = imageData.data[i + 2]
    const a = imageData.data[i + 3]
    if (a === 0) {
      continue
    }
    const rgba = `${r},${g},${b},${a}`
    if (!colors[rgba]) {
      colors[rgba] = [i]
    } else {
      colors[rgba].push(i)
    }
  }
  return colors
}

const convertToColorSVG = async (imageData, params) => {
  const colors = extractColors(imageData)

  let prefix = ''
  let suffix = ''
  let svgString = ''

  const promises = []
  let processed = 0
  const colorDominances = {}
  for (const [color, occurrences] of Object.entries(colors)) {
    promises.push(() => {
      let newImageData = createImageData(imageData.width, imageData.height)
      newImageData.data.fill(255)
      const len = occurrences.length
      for (let i = 0; i < len; i++) {
        const location = occurrences[i]
        newImageData.data[location] = 0
        newImageData.data[location + 1] = 0
        newImageData.data[location + 2] = 0
        newImageData.data[location + 3] = 255
      }
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve) => {
        colorDominances[color] = len / imageData.data.length
        let svg = await loadFromCanvas(canvasFromImageData(newImageData), params)
        newImageData = null
        const [r, g, b, a] = color.split(',')
        const alpha = (a / 255).toFixed(2)
        svg = svg.replace(
          'fill="#000000" stroke="none"',
          `fill="rgb(${r},${g},${b})" stroke="rgb(${r},${g},${b})"${
            a === '255' ? '' : ` fill-opacity="${alpha}" stroke-opacity="${alpha}"`
          } stroke-width="${params.strokeWidth}px"`
        )
        const pathRegEx = /<path\s*d="([^"]+)"\/>/g
        let matches
        const shortPaths = []
        while ((matches = pathRegEx.exec(svg)) !== null) {
          const path = matches[1]
          if (path.split(' ').length < params.minPathSegments) {
            shortPaths.push(matches[0])
          }
        }
        shortPaths.forEach((path) => {
          svg = svg.replace(path, '')
        })
        processed++
        if (!/<path/.test(svg)) {
          if (total === processed) {
            console.log('Potraced 100% %c■■', `color: rgba(${color})`, len / imageData.data.length)
          }
          resolve('')
          return
        }
        console.log(
          `Potraced ${String(((processed / total) * 100).toFixed())}% %c■■`,
          `color: rgba(${color})`, len / imageData.data.length
        )
        resolve(svg)
      })
    })
  }

  const total = promises.length
  const promiseChunks = []
  // @ToDo: What is the problem?
  const chunkSize = 1 // 2 * navigator.hardwareConcurrency || 16;
  while (promises.length > 0) {
    promiseChunks.push(promises.splice(0, chunkSize))
  }
  const svgs = []
  for (const chunk of promiseChunks) {
    svgs.push(await Promise.all(chunk.map((f) => f())))
  }

  for (const svg of svgs.flat()) {
    if (!prefix) {
      prefix = svg.replace(/(.*?<svg[^>]+>)(.*?)(<\/svg>)/, '$1')
      suffix = svg.replace(/(.*?<svg[^>]+>)(.*?)(<\/svg>)/, '$3')
      svgString = prefix
    }
    svgString += svg.replace(/(.*?<svg[^>]+>)(.*?)(<\/svg>)/, '$2')
  }
  svgString += suffix
  svgString = svgString.replace(/.*?<!DOCTYPE[^>]+>/, '')
  return { svg: svgString, colors: colorDominances }
}

// self.addEventListener('message', async (e) => {
//   const { imageData, params } = e.data;
//   const svg = await convertToColorSVG(imageData, params, e.ports[1]);
//   e.ports[0].postMessage({ result: svg });
// });
