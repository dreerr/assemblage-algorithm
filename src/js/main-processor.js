import { quantization } from '@/js/1-quantization'
import { vectorization } from '@/js/2-vectorization'
import { vectorization_new } from '@/js/2-vectorization-new'
import { rearrange } from '@/js/3-rearranging'

export const process = async (url, debug) => {
  // 0: get image data of url BEWARAE ONLY SAME ORIGIN!
  const imageData = await getImageData(url);

  // 1: reduce colors of image
  const imageDataReduced = await quantization(imageData);
  if (debug) {
    const img = new Image();
    img.src = url;
    debug.append(img);
    // let canvas = document.createElement("canvas");
    // canvas.width = imageDataReduced.width;
    // canvas.height = imageDataReduced.height;
    // var ctx = canvas.getContext("2d");
    // ctx.putImageData(imageDataReduced, 0, 0);
    // debug.append(canvas);
  }


  let afterVectorization = async result => {
    if (debug) {
      const span = document.createElement('span')
      debug.append(span);
      span.innerHTML = result;
    }
    rearrange(result).then(result => {
      if (debug) {
        const span = document.createElement('span')
        debug.append(span);
        span.innerHTML = result;
      }
    })
  }
  vectorization(imageDataReduced).then(afterVectorization);
  //vectorization_new(imageDataReduced).then(afterVectorization);

}


const getImageData = async url => {
  const img = new Image();
  img.src = url;
  await img.decode();
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  return context.getImageData(0, 0, img.width, img.height);
}