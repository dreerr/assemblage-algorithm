// Test import of a JavaScript module
import { example } from '@/js/example'

// Test import of styles
import '@/styles/index.scss'

// Test a public folder asset
const imagePublic = document.createElement('img')
imagePublic.src = '/assets/example.png'

const app = document.querySelector('#root')
app.append(imagePublic)
