import { SVG } from '@svgdotjs/svg.js';
import tinycolor from 'tinycolor2';
import '@svgdotjs/svg.filter.js'


/*

TODO:
* Make all attrs like surface relative

*/

export const rearrange = async (svg, debug) => {
  return new Promise((resolve) => {
    let aspectRatio = 3 / 2;
    let draw = SVG(svg);
    if(debug) draw.addTo(debug);

    // change aspect ratio of image
    let h = draw.height();
    let w = h * aspectRatio;
    draw.size(w, h);
    draw.viewbox(0, 0, w, h)
    //draw.viewbox(w / 4, h / 4, w / 2, h / 2)
    // console.log("drawing rearranged", draw.width(), draw.height())
    // console.log(" viewbox", draw.viewbox())
    let mainGroup = draw.first();

    // sort all paths from biggest to smallest
    let allPaths = draw.find('path');
    allPaths.sort((a, b) => {
      return surface(b) - surface(a);
    })

    let biggest;
    let numRemoved = 0;

    allPaths.forEach((el, idx) => {
      // check size and delete if too small
      if (surface(el) < 500000 && idx > 20) {
        el.remove();
        numRemoved++;
        return;
      };

      // search the biggest element
      if (surface(el) > surface(biggest)) biggest = el;

      // apply attributes from parent to path
      let attrs = el.parent().attr(['fill', 'stroke', 'stroke-width']);
      el.attr(attrs);
      el.addTo(mainGroup);

      // from here on you can play with center, transform, etc.
      //el.center(random(0.05*w, 0.95*w) / 0.1, (random(0.05*h,0.95*h) - h) / -0.1);

      // FAIL with Sinus, need more config I think
      let xPos = Math.sin(random(0, Math.PI)) * 0.5 + 0.25;
      let yPos = Math.sin(random(0, Math.PI)) * 0.5 + 0.25;
      el.center(xPos * w / 0.1, (yPos * h - h) / -0.1);

      // let relSize = (surface(el) / (surface(draw)*100) * 100) + 0.1;
      // let xPos = random(-relSize, relSize) + 0.5
      // let yPos = random(-relSize, relSize) + 0.5
      // el.center(xPos * w / 0.1, (yPos * h - h) / -0.1);

      el.transform({
        scale: random(1, 4),
        rotate: random(-90, 90)
      }, draw)
      el.css('filter', 'drop-shadow(0 0 180px rgba(0,0,0,0.3)')

    });
    let relSize = surface(biggest) / (surface(draw) * 100);
    console.log("relative biggest size", relSize);
    let c = tinycolor(biggest.attr('fill')).lighten().toString()
    draw.css('background-color', c)
    resolve(draw.svg())
  });
}

const random = (min=0, max=1) => {
  return Math.random() * (max - min) + min;
}

const surface = e => e===undefined ? 0 : e.width()*e.height();