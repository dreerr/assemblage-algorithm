import queue from 'childprocess-queue'
import { cpus } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const processQueue = queue.newQueue()
processQueue.setMaxProcesses(cpus() - 1)

const __dirname = dirname(fileURLToPath(import.meta.url))

export const addToQueue = (item) => {
  processQueue.fork(join(__dirname, 'queueChild.js'), [item], {
    onCreate: (child) => {
      child.on('message', msg => {
        console.log(msg)
      })

      child.on('close', msg => {
        console.log('child closed', msg, item)
      })

      child.on('error', msg => {
        console.log('Error in child', msg, item)
      })
    },
    execArgv: ['--stack-size=8192']
  })
}
