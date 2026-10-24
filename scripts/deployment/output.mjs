import { readFileSync } from "node:fs"
import { deploymentUrl } from "./result.mjs"

const result = JSON.parse(readFileSync(process.argv[2], "utf8"))

process.stdout.write(`url=${deploymentUrl(result)}\n`)
