import glob from 'glob'
import { processUrl } from './assemblage/assemblage.js';

const main = async () => {
  console.time("all elems");
  let items = glob.sync('../../Beispielbilder/*', {nosort: false});

  items = items.sort()
  for (const item of items) {
    console.log(item);
    await processUrl(item)
  }
}

main()
