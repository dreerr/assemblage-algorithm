const fs = require('fs');
const path = require('path');

const { createCanvas, loadImage } = require('canvas');

const { quantization } = require('./1-quantization.js')
const { vectorization } = require('./2-vectorization.js')
const { rearrange } = require('./3-rearranging.js')





module.exports.process = async (url) => {
  console.log('processing', url);
  console.time("total");
  const basename = path.basename(url);
  const imageData = await getImageData(url);

  // 1: reduce colors of image
  console.time("quantization");
  const imageDataReduced = await quantization(imageData);
  console.timeEnd("quantization");

  // 2: vectorize image
  console.time("vectorization");
  const vectorized = await vectorization(imageDataReduced);
  fs.writeFileSync(`./debug/${basename}-vectorized.svg`, vectorized)
  console.timeEnd("vectorization");

  // 3: rearrange the vectorized data
  console.time("rearranging");
  const rearranged = await rearrange(vectorized);
  console.timeEnd("rearranging");

  fs.writeFileSync(`./debug/${basename}-rearranged.svg`, rearranged)
  console.timeEnd("total");
  console.log('-----')
}



// Helper Functions
const getImageData = async (url, maxSize = 1000) => {
  let img = await loadImage(url);
  let w = img.width;
  let h = img.height;
  if (w > maxSize) {
    h = h * (maxSize / w);
    w = maxSize;
  }
  let canvas = createCanvas(w, h);
  let context = canvas.getContext('2d');
  context.drawImage(img, 0, 0, w, h);
  return context.getImageData(0, 0, w, h);
}

// // Helper Functions for Debug
// const canvasFromImageData = (imageData) => {
//   let canvas = document.createElement("canvas");
//   canvas.width = imageData.width;
//   canvas.height = imageData.height;
//   var ctx = canvas.getContext("2d");
//   ctx.putImageData(imageData, 0, 0);
//   return canvas;
// }

