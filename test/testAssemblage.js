import * as chai from "chai"
import chaiAsPromised from "chai-as-promised"
import glob from "glob"
import natsort from "natsort"
import path from "path"
import { emptyDirSync } from "fs-extra"
import { addToQueue } from "../src/queue.js"

chai.use(chaiAsPromised)

describe("Assemblage", () => {
  describe("Test Algorithm", () => {
    const items = glob.sync("../../Beispielbilder/Marketing/**/*.*")
    const testDir = "./test-results-final-seed-with-comparison/"
    const debugDir = "./test-results-final-seed-with-comparison/debug/"
    items.sort(natsort.default())
    emptyDirSync(testDir)
    emptyDirSync(debugDir)
    it("Examples", async () => {
      await Promise.all(
        items.map((item) => {
          const basenameNoExt = path.basename(item).replace(/\.[^/.]+$/, "")
          const outputFile = path.join(testDir, basenameNoExt + ".svg")
          return addToQueue(item, outputFile, {
            // debug: debugDir,
            renderSize: 3000,
            // seed: "1337",
          }).catch(() => {}) //
        })
      )
    }).timeout(100000000)
  })
})
