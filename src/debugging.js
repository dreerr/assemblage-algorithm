import fs from "fs"
import path from "path"
import { canvasFromImageData } from "./vectorization.js"

export const debugging = (data, debugPath, source) => {
  const basenameNoExt = path.basename(source).replace(/\.[^/.]+$/, "")
  const scaled = fs.createWriteStream(
    path.join(debugPath, basenameNoExt + "A_scaled.png")
  )
  const scaledStream = canvasFromImageData(data.resized).createPNGStream()
  scaledStream.pipe(scaled)
  const reduced = fs.createWriteStream(
    path.join(debugPath, basenameNoExt + "B_reduced.png")
  )
  const reducedStream = canvasFromImageData(data.reduced).createPNGStream()
  reducedStream.pipe(reduced)
  fs.writeFileSync(
    path.join(debugPath, basenameNoExt + "C_vectorized.svg"),
    data.vectorized.svg
  )
  fs.writeFileSync(
    path.join(debugPath, basenameNoExt + "D_rearranged.svg"),
    data.rearranged
  )
}
