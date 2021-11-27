// Test import of a JavaScript module
//import { example } from '@/js/example'

import { quantization } from '@/js/quantization'
import { vectorization } from '@/js/vectorization'
import { trace } from '@/js/vectorization-new'

import { SVG } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.filter.js'

// Test import of styles
import '@/styles/index.scss'

const app = document.querySelector('#root');



(async () => {

  const imagePublic = new Image();
  imagePublic.src = '/assets/example1.png';
  await imagePublic.decode();
  app.append(imagePublic);

  var othersvg = trace(imagePublic.src).then((result) => {
    //console.log(result);
  });


  var ican = await quantization(imagePublic);
  app.append(ican);

  var ctx = ican.getContext('2d');
  var data = ctx.getImageData(0, 0, ican.width, ican.height);

  const svg = await vectorization(data);
  const span = document.createElement('span')
  app.append(span);
  span.innerHTML = svg;

  var draw = SVG().size(600,600).addTo(app);
  draw.svg(svg);
  console.log(draw.find('path'));
  draw.find('path').forEach(element => {
    element.transform({
      rotate: Math.random()*180,
      //translateX: 50,
      //translateY: 100,
      scale: 2
    })

    // element.filterWith(function (add) {
    //   var blur = add.offset(0, 0).in(add.$sourceAlpha).gaussianBlur(100).opacity(0.1);
    //   add.blend(add.$source, blur)
    //   this.size('200%', '200%').move('-50%', '-50%')
    // })
    //element.attr('x', 50)
  });


})();
