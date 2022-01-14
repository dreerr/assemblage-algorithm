import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import glob from 'glob'
import natsort from 'natsort'
import { addToQueue } from '../src/queue.js'
import path from 'path'
import { emptyDirSync, mkdirpSync } from 'fs-extra'
chai.use(chaiAsPromised)
const should = chai.should()

describe('Assemblage', () => {
  describe('Test Algorithm', () => {
    const items = glob.sync('../../Beispielbilder/*')
    const testDir = './test-results/'
    const debugDir = './test-results/debug/'
    items.sort(natsort.default())
    emptyDirSync(testDir)
    emptyDirSync(debugDir)
    it('Examples', async () => {
      await Promise.all(items.map((item) => {
        const basenameNoExt = path.basename(item).replace(/\.[^/.]+$/, '')
        const outputFile = path.join(testDir, basenameNoExt + '.svg')
        return addToQueue(item, outputFile, { debug: debugDir })
      }))
    }).timeout(300000)
  })
})
