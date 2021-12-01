import ImageTracer from 'imagetracerjs';

export const vectorization_new = async (imageData) => {
  //https://github.com/jankovicsandras/imagetracerjs/blob/master/options.md

  let svgStr = ImageTracer.imagedataToSVG(
    imageData,
    { numberofcolors: 16, blurradius: 5 }
  );

  // Small Hack to add viewBow
  let w = svgStr.match(/(?<=width=").+?(?=")/)[0];
  let h = svgStr.match(/(?<=height=").+?(?=")/)[0];
  return svgStr.replace('<svg', `<svg viewBox="0 0 ${h} ${h}"`);
}
