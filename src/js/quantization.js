import RgbQuant from 'rgbquant';

export const quantization = async (image) => {


  // options with defaults (not required)
  var opts = {
    colors: 16,             // desired palette size
    method: 2,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
    boxSize: [64, 64],        // subregion dims (if method = 2)
    boxPxls: 2,              // min-population threshold (if method = 2)
    initColors: 4096,        // # of top-occurring colors  to start with (if method = 1)
    minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
    dithKern: null,          // dithering kernel name, see available kernels in docs below
    dithDelta: 0,            // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
    dithSerp: false,         // enable serpentine pattern dithering
    palette: [],             // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
    reIndex: false,          // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
    useCache: true,          // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
    cacheFreq: 10,           // min color occurance count needed to qualify for caching
    colorDist: "euclidean",  // method used to determine color distance, can also be "manhattan"
  };

  var q = new RgbQuant(opts);


  q.sample(image);

  var pal = q.palette();
  console.log(pal);
  var out = q.reduce(image);
  var ican = drawPixels(out, image.width);
  return ican;
}


const typeOf = (val) => {
  return Object.prototype.toString.call(val).slice(8, -1);
}

const drawPixels = (idxi8, width0, width1) => {
  var idxi32 = new Uint32Array(idxi8.buffer);

  width1 = width1 || width0;

  var can = document.createElement("canvas"),
    can2 = document.createElement("canvas"),
    ctx = can.getContext("2d"),
    ctx2 = can2.getContext("2d");

  can.width = width0;
  can.height = Math.ceil(idxi32.length / width0);
  can2.width = width1;
  can2.height = Math.ceil(can.height * width1 / width0);

  ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.msImageSmoothingEnabled = false;
  ctx2.imageSmoothingEnabled = ctx2.mozImageSmoothingEnabled = ctx2.webkitImageSmoothingEnabled = ctx2.msImageSmoothingEnabled = false;

  var imgd = ctx.createImageData(can.width, can.height);

  if (typeOf(imgd.data) == "CanvasPixelArray") {
    var data = imgd.data;
    for (var i = 0, len = data.length; i < len; ++i)
      data[i] = idxi8[i];
  }
  else {
    var buf32 = new Uint32Array(imgd.data.buffer);
    buf32.set(idxi32);
  }

  ctx.putImageData(imgd, 0, 0);

  ctx2.drawImage(can, 0, 0, can2.width, can2.height);

  return can2;
}
