import RgbQuant from "rgbquant"

import pkg from "canvas"
const { createImageData } = pkg

export const quantization = async (image) => {
  // options with defaults (not required)
  const opts = {
    colors: 16, // desired palette size
    method: 2, // histogram method, 2: min-population threshold within subregions; 1: global top-population
    boxSize: [64, 64], // subregion dims (if method = 2)
    boxPxls: 2, // min-population threshold (if method = 2)
    initColors: 4096, // # of top-occurring colors  to start with (if method = 1)
    minHueCols: 0, // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
    dithKern: null, // dithering kernel name, see available kernels in docs below
    dithDelta: 0, // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
    dithSerp: false, // enable serpentine pattern dithering
    palette: [], // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
    reIndex: false, // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
    useCache: true, // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
    cacheFreq: 10, // min color occurance count needed to qualify for caching
    colorDist: "euclidean", // method used to determine color distance, can also be "manhattan"
  }

  const q = new RgbQuant(opts)
  q.sample(image.data, image.width)
  // let pal = q.palette();
  const reducedArray = q.reduce(image.data)
  const imageData = createImageData(
    new Uint8ClampedArray(reducedArray.buffer),
    image.width,
    image.height
  )
  return imageData
}
