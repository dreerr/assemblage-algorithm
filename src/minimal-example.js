const fs = require('fs');
const { SVG, registerWindow } = require('@svgdotjs/svg.js')
const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const document = window.document
registerWindow(window, document)

let svg = fs.readFileSync('./src/minimal-example-path.svg', 'utf8')
let draw = SVG(document.documentElement);
draw.svg(svg);
draw.find('path').forEach((el, idx) => {
  console.log(idx)
  console.log(el.width())
})
