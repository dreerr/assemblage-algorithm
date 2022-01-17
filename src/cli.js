#!/usr/bin/env node

import { Command } from "commander"
import { assemblage } from "./index.js"
import path from "path"
import { existsSync } from "fs"
;(async () => {
  const program = new Command()
  program
    .description(
      "Assemblage is an algorithm which arranges objects found on the Ethereum blockchain."
    )
    .argument("<image>", "Specify the image file to process")
    .requiredOption(
      "-a, --address <address>",
      "The address of the source token"
    )
    .requiredOption(
      "-t, --token-id <token-id>",
      "The token ID of the source token"
    )

  if (process.argv.length === 2) {
    program.help()
    return
  }

  program.parse()
  const options = program.opts()
  const source = program.args[0]
  if (!existsSync(source)) {
    console.error("File not found!")
    return
  }
  const target = path.join(path.dirname(source), "Assemblage.svg")
  await assemblage(source, target, {
    seed: `${options.address}-${options.tokenId}`,
  })
})()
