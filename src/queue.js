import queue from 'childprocess-queue'
import { cpus } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const processQueue = queue.newQueue()
processQueue.setMaxProcesses(cpus().length - 1)

const __dirname = dirname(fileURLToPath(import.meta.url))

export const addToQueue = (sourceFile, targetFile, opts = {}) => {
  return new Promise((resolve, reject) => {
    processQueue.fork(
      join(__dirname, 'queueChild.js'),
      [sourceFile, targetFile, JSON.stringify(opts)],
      {
        onCreate: (child) => {
          child.on('message', msg => {
            console.log('message from child', msg)
          })

          child.on('close', msg => {
            if (msg === 0) {
              resolve(targetFile)
            } else {
              reject(Error('Error during child closing: ' + msg))
            }
          })

          child.on('error', msg => {
            reject(Error('Error during child closing: ' + msg))
          })
        },
        execArgv: ['--stack-size=8192']
      })
  })
}
