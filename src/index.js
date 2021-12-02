import '@/styles/index.scss'
import { process } from '@/js/main-processor'

const app = document.querySelector('#root');


// for (let index = 0; index < 50; index++) {
//   let path = `/assets/example${index}.png`
//   processUrl(path)
// }


const processUrl = url => {
  let div = document.createElement('div')
  div.className = 'debug'
  app.append(div)
  process(url, div)
}

processUrl('https://lh3.googleusercontent.com/YNu5EBZXJQKIaynTrm6M1QeJwJaGkmLVYZ-4DmfGcySEuV-SHM9B0xqdDR5ij6D9yiPUgdH7rGSTfTGjgURoaMHLSr5AG9-MIVCk3g')