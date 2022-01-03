import nodemon from 'nodemon'

if (process.env.NODE_ENV === 'production') {
  import('./dist/index.js')
} else {
  nodemon({ script: 'dev.js' })
}
