import '@/styles/index.scss'
import { process } from '@/js/main-processor'

const app = document.querySelector('#root');


for (let index = 1; index < 20; index++) {
  let path = `/assets/example${index}.png`
  let div = document.createElement('div')
  app.append(div)
  process(path, div)
}

