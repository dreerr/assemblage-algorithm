const { SVG, registerWindow } = require('@svgdotjs/svg.js')
const { createSVGWindow } = require('svgdom')
const tinycolor = require('tinycolor2');

// register window and document
const window = createSVGWindow()
const document = window.document
registerWindow(window, document)

module.exports.rearrange = async (svg) => {
  return new Promise((resolve) => {
    let aspectRatio = 3 / 2;
    let draw = SVG(svg).addTo(document.documentElement);
    draw.attr('xmlns', 'http://www.w3.org/2000/svg')

    // change aspect ratio of image
    let h = draw.height();
    let w = h * aspectRatio;
    draw.size(w, h);

    // zoom in a little with viewBox
    let zoomAmount = 0.1;
    draw.viewbox(
      zoomAmount * w,
      zoomAmount * h,
      w - zoomAmount * w * 2,
      h - zoomAmount * h * 2
    )

    // get main group and set full opacity
    let mainGroup = draw.first();
    mainGroup.attr('fill-opacity', 1)
    mainGroup.attr('stroke-opacity', 1)

    // // sort all paths from biggest to smallest
    let allPaths = draw.find('path');
    allPaths.sort((a, b) => {
      return b.length() - a.length();
    })

    // Iterate over all paths
    allPaths.forEach((el, idx) => {
      // Check if elems qualify
      let areaIsSmall = area(el) < 500000
      let atLeastSomeElems = idx > 20
      let colorIncluded = el.parent().data('visited') == true
      let areaIsTiny = area(el) < 5000
      if ((areaIsSmall && atLeastSomeElems && colorIncluded) || areaIsTiny) {
        el.remove();
        return;
      }

      el.parent().data('visited', true)

      // apply attributes from parent to path
      let attrs = el.parent().attr(['fill', 'stroke', 'stroke-width']);
      el.attr(attrs);
      el.addTo(mainGroup);

      // from here on you can play with center, transform, etc.
      //el.center(random(0.1*w, 0.9*w) / 0.1, (random(0.1*h,0.9*h) - h) / -0.1);

      // FAIL with Sinus, need more config I think
      // TODO
      let xPos = Math.sin(random(0, Math.PI)) * 0.5 + 0.2;
      let yPos = Math.sin(random(0, Math.PI)) * 0.5 + 0.2;
      el.center(xPos * w / 0.1, (yPos * h - h) / -0.1);

      // let relSize = (area(el) / (area(draw)*100) * 100) + 0.1;
      // let xPos = random(-relSize, relSize) + 0.5
      // let yPos = random(-relSize, relSize) + 0.5
      // el.center(xPos * w / 0.1, (yPos * h - h) / -0.1);

      el.transform({
        scale: random(1, 3),
        rotate: random(-90, 90)
      }, draw)

      // transform small elements a bit more
      if (area(el) < 15000) {
        el.transform({
          scale: random(1, 10),
        }, draw)
      }

      // apply drop shadow
      el.css('filter', 'drop-shadow(0 0 180px rgba(0, 0, 0, 0.15)')
      // TODO: move inline style to https://developer.mozilla.org/en-US/docs/Web/SVG/Element/style

    });

    let c = tinycolor(allPaths[0].attr('fill')).toString() // was lighted
    var rect = SVG().rect(w, h).fill(c)
    rect.insertBefore(mainGroup)

    // remove the biggest elems
    allPaths[0].remove();
    allPaths[1].remove();

    resolve(draw.svg())
  });
}

const random = (min=0, max=1) => {
  return Math.random() * (max - min) + min;
}

const area = el => el === undefined ? 0 : el.width() * el.height()