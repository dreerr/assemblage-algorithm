var glob = require("glob")
const fs = require('fs');
const { rearrange } = require('./js/3-rearranging.js')

var { process } = require('./js/main-processor.js');

const main = async () => {
  // process('./public/example17.png').then((e) => {
  //   console.log(e);
  // });
  // return
  console.time("all elems");
  let items = glob.sync('./public/*.png');
  for (let index = 18; index < items.length; index++) {
    const element = items[index];
    await process(element);
  }
  console.timeEnd("all elems");
}

main()

// process('https://www.placecage.com/1000/1000')