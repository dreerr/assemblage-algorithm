import '@/styles/index.scss'
import { process } from '@/js/main-processor'

const app = document.querySelector('#root');


for (let index = 0; index < 50; index++) {
  let path = `/assets/example${index}.png`
  let div = document.createElement('div')
  div.className = 'debug'
  app.append(div)
  process(path, div)
}

