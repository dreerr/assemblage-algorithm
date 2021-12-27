import { SVG, registerWindow } from '@svgdotjs/svg.js'
import { createSVGWindow } from 'svgdom'
import '@svgdotjs/svg.filter.js'
import SeedRandom from 'seedrandom'

// register window and document
const window = createSVGWindow()
const document = window.document
registerWindow(window, document)

export const rearrange = async (obj) =>
  new Promise((resolve) => {
    // INITALIZE RANDOMNESS
    const rs = new SeedRandom(obj.svg)
    const random = (min = 0, max = 1) => rs() * (max - min) + min

    // DRAW SVG
    const draw = SVG(obj.svg).addTo(document.documentElement)
    draw.attr('xmlns', 'http://www.w3.org/2000/svg')

    // CHANGE ASPECT RATIO OF IMAGE
    const aspectRatio = 3 / 2
    const h = draw.height()
    const w = h * aspectRatio
    draw.size(w, h)

    // ZOOM IN A LITTLE WITH VIEWBOX
    const zoomAmount = 0.0
    draw.viewbox(zoomAmount * w, zoomAmount * h, w - zoomAmount * w * 2, h - zoomAmount * h * 2)

    // DEFINE AREA FUNCTIONS
    const area = (el) => {
      if (!el) return 0
      return (el.width() * el.height()) / (h * w)
      // if (el.area === undefined) el.area = (el.width() * el.height()) / (h * w)
      // return el.area
    }
    const isTooSmall = (el) => {
      return area(el) < 0.025
    }

    // ITERATE OVER THE COLOR GROUPS AND RANDOMLY PICK ELEMENTS
    const maxItems = Math.floor(80 / draw.children().length)
    console.log('maxItems', maxItems)
    draw.children().forEach(group => {
      const elems = draw.group()
      // TRY MAX 100 TIMES TO GET RANDOM ITEMS WHICH ARE NOT TOO SMALL
      for (let i = 0; i < 100; i++) {
        const randomIdx = Math.floor(random(0, group.children().length - 1))
        const el = group.get(i === 0 ? 0 : randomIdx)
        if (!isTooSmall(el)) {
          elems.add(el)
          if (elems.children().length >= maxItems) break
          if (group.children().length === 0) break
        }
      }
      // BACKUP IF EVERY ITEM WAS TOO SMALL AND ADD THE FIRST
      if (elems.children().length === 0 && draw.children().length <= 3) { elems.add(group.get(0)) }
      group.clear()
      elems.children().forEach(el => group.add(el))
    })

    // GET MAIN GROUP AND SET FULL OPACITY
    const mainGroup = draw.first()
    mainGroup.attr('fill-opacity', 1)
    mainGroup.attr('stroke-opacity', 0)

    // SORT ALL PATHS FROM BIGGEST TO SMALLEST
    const allPaths = draw.find('path')

    // ITERATE OVER ALL PATHS
    allPaths.forEach((el) => {
      // APPLY ATTRIBUTES FROM PARENT TO PATH
      const attrs = el.parent().attr(['fill'])
      el.attr(attrs)
      // var group = mainGroup.group()
      // el.addTo(group)

      // GET RANDOM POINT INSIDE CIRCLE AND POSITION
      // let r = h/2.3 * Math.sqrt(random())
      // let r = h/2.3 * random()
      const r = h / 2.3 * Math.pow(random(), 0.67)
      const theta = random() * 2 * Math.PI
      const x = w / 2 + r * aspectRatio * Math.cos(theta)
      const y = h / 2 + r * Math.sin(theta)
      el.center(x * 10, y * 10)

      // SHUFFLE SIZE AND ROTATION
      let randomScale
      if (area(el) < 0.04) randomScale = random(4, 10)
      else if (area(el) < 0.1) randomScale = random(2, 6)
      else if (area(el) > 2) randomScale = random(0.5, 4)
      else randomScale = random(1, 5)
      el.transform({
        scale: randomScale,
        rotate: random(0, 360)
      })
      el.area *= randomScale

      // APPLY DROP SHADOW / TODO: NATIVE?
      el.css('filter', 'drop-shadow(0 0 220px rgba(0, 0, 0, 0.25)')
      // group.css('filter', 'url("#svgBlur")')
      // el.filterWith(function (add) {
      //   // var blur = add.in(add.$sourceAlpha).flood('black', 0.1).gaussianBlur(5)
      //   var blur = add.offset(20, 20).in(add.$sourceAlpha).gaussianBlur(5)
      //   add.blend(add.$source, blur)

      //   this.size('200%', '200%').move('-50%', '-50%')
      // })
    })

    allPaths.sort((a, b) => area(b) - area(a))
    allPaths.forEach(el => el.addTo(mainGroup))

    // SET FILTER
    draw.add(`<filter height="200%" width="200%" y="-50%" x="-50%" id="svgBlur">
      <feColorMatrix result="matrixOut" in="SourceGraphic" type="matrix"
      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
      <feGaussianBlur result="blurOut" in="offOut" stdDeviation="220" />
      <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
    </filter >`)

    // SET BACKGROUND
    const arr = Object.values(obj.colors)
    const i = arr.indexOf(Math.max(...arr))
    const dominantColor = `rgba(${Object.keys(obj.colors)[i]})`
    const rect = SVG().rect(w, h).fill(dominantColor)
    rect.insertBefore(mainGroup)

    // REMOVE THE BIGGEST ELEMS
    if (allPaths.length > 5) allPaths[0].remove()
    if (allPaths.length > 10) allPaths[1].remove()

    resolve(draw.svg())
  })
