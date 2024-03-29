import { SVG, registerWindow } from "@svgdotjs/svg.js"
import { createSVGWindow } from "svgdom"
import "@svgdotjs/svg.filter.js"
import pkg from "seedrandom"
const { alea: Alea } = pkg

// register window and document
const window = createSVGWindow()
const document = window.document
registerWindow(window, document)

export const rearrange = async ({ svg, colors, seed = "0x0" }) =>
  new Promise((resolve) => {
    // INITALIZE RANDOMNESS
    const rs = new Alea(seed)
    const random = (min = 0, max = 1) => rs() * (max - min) + min

    // DRAW SVG
    const draw = SVG(svg).addTo(document.documentElement)
    draw.attr("xmlns", "http://www.w3.org/2000/svg")

    // CHANGE ASPECT RATIO OF IMAGE
    const aspectRatio = 3 / 2
    const oldH = draw.height()
    const oldW = oldH * aspectRatio
    const w = 1050
    const h = 700
    draw.size(w, h)

    // ZOOM IN A LITTLE WITH VIEWBOX
    const zoomAmount = 0.0
    draw.viewbox(
      zoomAmount * w,
      zoomAmount * h,
      w - zoomAmount * w * 2,
      h - zoomAmount * h * 2
    )

    // GET ALL GROUPS AND INIT SHAPES
    const colorGroups = draw.children()
    const allShapes = []

    // DEFINE AREA FUNCTIONS
    const area = (el) => {
      if (!el) return 0
      // return (el.width() * el.height()) / (h * w)
      if (el.area === undefined)
        el.area = (el.width() * el.height()) / (oldH * oldW)
      return el.area
    }
    const isTooSmall = (el) => area(el) < 0.02

    // DEFINE ALTER ELEMENT
    const alterElement = (el) => {
      // APPLY ATTRIBUTES FROM PARENT TO PATH
      const fill = el.parent().attr("fill")
      el.attr("fill", fill)

      // EVERY ELEM GETS A GROUPT THAT SHADOW CAN BE APPLIED
      const group = draw.group()
      el.addTo(group)
      group.addClass("s")
      allShapes.push(el)

      // GET RANDOM POINT INSIDE CIRCLE AND POSITION
      const r = (h / 2.5) * random() ** 0.67
      const theta = random() * 2 * Math.PI
      const x = w / 2 + r * aspectRatio * Math.cos(theta)
      const y = h / 2 + r * Math.sin(theta)

      // SHUFFLE SIZE AND ROTATION
      let randomScale
      if (area(el) < 0.04) randomScale = random(4, 10)
      else if (area(el) < 0.1) randomScale = random(1, 9)
      else if (area(el) > 2) randomScale = random(0.5, 2)
      else randomScale = random(1, 3)

      el.transform({
        scale: [0.1, -0.1],
        origin: { x: 0, y: -w },
        // origin: { x: 'center', y: 'center' },
        translate: { x: 0, y: w * 1.7666666 },
      }).transform(
        {
          scale: randomScale * (h / oldH),
          rotate: random(0, 360),
        },
        true
      )
      group.center(x, y)
      // el.area *= randomScale
    }

    // ITERATE OVER THE COLOR GROUPS AND RANDOMLY PICK ELEMENTS
    const maxItemsPerColor = Math.floor(80 / draw.children().length)

    colorGroups.forEach((colorGroup) => {
      let numElems = 0

      // TRY MAX 100 TIMES TO GET RANDOM ITEMS WHICH ARE NOT TOO SMALL
      // as an artistic touch we decided to make this 350
      for (let i = 0; i < 350; i += 1) {
        const randomIdx =
          i === 0 ? 0 : Math.floor(random(0, colorGroup.children().length - 1))
        const el = colorGroup.get(randomIdx)
        if (!isTooSmall(el)) {
          alterElement(el)
          numElems += 1
          if (numElems >= maxItemsPerColor) break
          if (colorGroup.children().length === 0) break
        }
      }
      // BACKUP IF EVERY ITEM WAS TOO SMALL: ADD THE FIRST ITEM NO MATTER WHAT
      if (numElems === 0 && draw.children().length <= 3) {
        const el = colorGroup.get(0)
        alterElement(el)
        numElems += 1
      }
      colorGroup.remove()
    })

    allShapes.sort((a, b) => area(b) - area(a))
    allShapes.forEach((el) => el.parent().addTo(draw))

    // SET BACKGROUND
    const colorsArray = Object.values(colors)
    const i = colorsArray.indexOf(Math.max(...colorsArray))
    const dominantColor = `rgb(${Object.keys(colors)[i].replace(/,\d+$/, "")})`
    const rect = SVG().rect(w, h).fill(dominantColor)
    rect.insertBefore(draw.first())

    // SET FILTER
    rect.before(`<defs>
      <style>
        .s {
          filter: url(#shadow);
        }
      </style>
      <filter id="shadow" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
    </defs>`)

    // REMOVE THE BIGGEST ELEMS
    if (allShapes.length > 5) allShapes[0].parent().remove()
    if (allShapes.length > 10) allShapes[1].parent().remove()

    // PRAY TO THE SVG GOD
    resolve(draw.svg())
  })
