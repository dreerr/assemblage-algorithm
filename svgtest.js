import { SVG, registerWindow } from '@svgdotjs/svg.js'
import { createSVGWindow } from 'svgdom'
import fs from 'fs'

const window = createSVGWindow()
const document = window.document
registerWindow(window, document)

const svg = fs.readFileSync('./out.svg')

const draw = SVG().addTo(document.documentElement)
draw.svg(svg)
draw.size(200, 200)
draw.find('path')

const paths = draw.find('path')
// const draw = SVG(svg).addTo(document.documentElement)

paths.forEach(el => {
  try {
    el.width()
  } catch (error) {
    console.log(error)
  }
})
