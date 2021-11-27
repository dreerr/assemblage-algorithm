import ImageTracer from 'imagetracerjs';

export const trace = async (imageUrl) => {
  //https://github.com/jankovicsandras/imagetracerjs/blob/master/options.md
  return new Promise((resolve) => {
    ImageTracer.imageToSVG(
      imageUrl,
      (svgstr) => {
        ImageTracer.appendSVGString(svgstr, 'svgcontainer');
        resolve(svgstr);
      },
      { numberofcolors: 16, blurradius: 5 }
    );
  });
}
