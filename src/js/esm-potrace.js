// Test a public folder asset
import potrace from 'esm-potrace-wasm';

const imagePublic = document.createElement('img')
imagePublic.src = '/assets/example.png';
const app = document.querySelector('#root');
app.append(imagePublic);

(async () => {

  const div = document.createElement('div')
  app.append(div);

  const blob = await fetch('/assets/example.png').then((response) => response.blob());

  let svg = await potrace(blob, {
    turdsize: 1,
    turnpolicy: 4,
    alphamax: 1,
    opticurve: 1,
    opttolerance: 0.2,
    pathonly: false,
  });
  const div = document.createElement('div')
  app.append(div);
  div.innerHTML = svg;
  svg = svg.replaceAll('><', '>\n<');
})();