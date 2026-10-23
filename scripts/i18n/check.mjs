import { readdirSync, readFileSync } from "node:fs"
import { basename, join, resolve } from "node:path"
import { checkDictionaries, parseDictionary } from "./dictionary.mjs"

const directory = resolve(process.argv[2] ?? "src/shared/lib/i18n/dictionaries")

try {
  const locales = readdirSync(directory).filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts"))

  const dictionaries = Object.fromEntries(
    locales.map((file) => {
      const locale = basename(file, ".ts")

      return [locale, parseDictionary(readFileSync(join(directory, file), "utf8"), locale)]
    }),
  )

  const problems = checkDictionaries(dictionaries)

  if (problems.length > 0) {
    throw new Error(problems.join("\n"))
  }

  process.stdout.write(`i18n: ${locales.length} locale(s), recursive keys and interpolation placeholders match ru.\n`)
} catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
}
