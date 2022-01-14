import { exit } from "process"
import { assemblage } from "./assemblage.js"

const source = process.argv[2]
const target = process.argv[3]
const opts = ((raw) => {
  try {
    return JSON.parse(raw)
  } catch (err) {
    return {}
  }
})(process.argv[4])

if (source === "" || target === "") exit(1)

assemblage(source, target, opts)
