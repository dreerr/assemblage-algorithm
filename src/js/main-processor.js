import { quantization } from '@/js/1-quantization'
import { vectorization } from '@/js/2-vectorization'
import { rearrange } from '@/js/3-rearranging'
import axios from 'axios'
import { Buffer } from 'buffer'

export const process = async (url, debug) => {

  // 0: get image data of url BEWARAE ONLY SAME ORIGIN!
  const imageData = await getImageData(url);
  if (debug) debug.append(canvasFromImageData(imageData));

  // 1: reduce colors of image
  const imageDataReduced = await quantization(imageData);
  // if (debug) debug.append(canvasFromImageData(imageDataReduced));

  // 2: vectorize image
  const vectorized = await vectorization(imageDataReduced);
  // if (debug) debug.append(nodeFromSvg(vectorized));

  // 3: rearrange the vectorized data
  const rearranged = await rearrange(vectorized, debug);
  return rearranged;
}



// Helper Functions
const getImageData = async (url, maxSize = 1000) => {
  let img = new Image();
  img.src = await getBase64(url);
  await img.decode();
  let w = img.width;
  let h = img.height;
  if (w > maxSize) {
    h = h * (maxSize / w);
    w = maxSize;
  }
  let canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  let context = canvas.getContext('2d');
  context.drawImage(img, 0, 0, w, h);
  return context.getImageData(0, 0, w, h);
}

// Helper Functions for Debug
const canvasFromImageData = (imageData) => {
  let canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  var ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

const getBase64 = async (url) => {
  try {
    let image = await axios.get(url, { responseType: 'arraybuffer' });
    let raw = Buffer.from(image.data).toString('base64');
    return "data:" + image.headers["content-type"] + ";base64," + raw;
  } catch (error) {
    console.log(error)
  }
}

const nodeFromSvg = (svgData) => {
  const node = document.createElement('span')
  node.innerHTML = svgData;
  return node;
}