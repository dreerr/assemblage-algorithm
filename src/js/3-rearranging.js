import { SVG } from '@svgdotjs/svg.js';
import tinycolor from 'tinycolor2';
import '@svgdotjs/svg.filter.js'


export const rearrange = async svg => {
  return new Promise((resolve) => {
    let aspectRatio = 16 / 9;
    let draw = SVG(svg);

    // change aspect ratio of image
    let h = draw.height();
    let w = h * aspectRatio;
    draw.size(w, h);
    draw.viewbox(0, 0, w, h)
    console.log(draw.width(), draw.height())
    let mainGroup = draw.first();

    // sort all paths from biggest to smallest
    let allPaths = draw.find('path');
    allPaths.sort((a, b) => {
      return surface(b) - surface(a);
    })


    let biggest;
    allPaths.forEach((el) => {
      // Check Size and delete if too small
      if ((el.width() * el.height()) < 8000) {
        el.remove();
        return;
      };

      // apply attributes from parent to path
      let attrs = el.parent().attr(['fill', 'stroke', 'stroke-width']);
      el.attr(attrs);
      el.addTo(mainGroup);

      //
      el.center(random(0.05*w, 0.95*w) / 0.1, (random(0.05*h,0.95*h) - h) / -0.1);
      //el.center(0.5*w / 0.1, (0.5*h - h) / -0.1);
      if (surface(el) > surface(biggest)) biggest = el;

      el.transform({
        scale: random(1, 3),
        rotate: random(-90, 90)
      }, draw)
      el.css('filter', 'drop-shadow(0 0 180px rgba(0,0,0,0.3)')
      // el.filterWith(function (add) {
      //   var blur = add.offset(0, 0).in(add.$sourceAlpha).gaussianBlur(100).opacity(0.1);
      //   add.blend(add.$source, blur)
      //   this.size('200%', '200%').move('-50%', '-50%')
      // })
    });
    let c = tinycolor(biggest.attr('fill')).lighten().toString()
    draw.css('background-color', c)

    resolve(draw.svg())
  });
}

const random = (min=0, max=1) => {
  return Math.random() * (max - min) + min;
}

const surface = e => e===undefined ? 0 : e.width()*e.height();