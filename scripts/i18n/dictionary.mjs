import ts from "typescript"

function unwrap(node) {
  return ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node) ? unwrap(node.expression) : node
}

function leafEntries(node, prefix = "", leaves = Object.create(null)) {
  const value = unwrap(node)

  if (!ts.isObjectLiteralExpression(value)) {
    throw new Error(`Dictionary ${prefix || "root"} must be an object literal`)
  }

  if (value.properties.length === 0) {
    throw new Error(`Dictionary contains an empty object at ${prefix || "root"}`)
  }

  const names = new Set()

  for (const property of value.properties) {
    if (!ts.isPropertyAssignment(property) || !property.name || ts.isComputedPropertyName(property.name)) {
      throw new Error("Dictionary entries must be literal property assignments")
    }

    const name = property.name.text
    const path = prefix ? `${prefix}.${name}` : name

    if (names.has(name) || Object.hasOwn(leaves, path)) {
      throw new Error(`Dictionary contains duplicate key ${path}`)
    }

    names.add(name)

    const initializer = unwrap(property.initializer)

    if (ts.isObjectLiteralExpression(initializer)) {
      leafEntries(initializer, path, leaves)
    } else if (ts.isStringLiteralLike(initializer)) {
      leaves[path] = initializer.text
    } else {
      throw new Error(`Dictionary ${path} must be a string literal or object literal`)
    }
  }

  return leaves
}

export function parseDictionary(source, locale) {
  const file = ts.createSourceFile(`${locale}.ts`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

  if (file.parseDiagnostics.length > 0) {
    throw new Error(`${locale}: invalid TypeScript dictionary`)
  }

  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement) || !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      continue
    }

    const declaration = statement.declarationList.declarations.find((entry) => ts.isIdentifier(entry.name) && entry.name.text === locale)

    if (declaration?.initializer) {
      return leafEntries(declaration.initializer)
    }
  }

  throw new Error(`${locale}: missing exported ${locale} object literal`)
}

function placeholders(value) {
  return [...value.matchAll(/{{\s*-?\s*([^{}]+?)\s*}}/g)]
    .map((match) => match[1].split(",")[0].trim())
    .sort()
    .join("\0")
}

export function checkDictionaries(dictionaries) {
  const canonical = dictionaries.ru

  if (!canonical) {
    throw new Error("Canonical ru dictionary is required")
  }

  const problems = []

  for (const [locale, dictionary] of Object.entries(dictionaries)) {
    for (const [key, value] of Object.entries(dictionary)) {
      if (!value.trim()) {
        problems.push(`${locale}: empty value at ${key}`)
      }
    }

    for (const key of Object.keys(canonical)) {
      if (!Object.hasOwn(dictionary, key)) {
        problems.push(`${locale}: missing key ${key}`)
      } else if (placeholders(canonical[key]) !== placeholders(dictionary[key])) {
        problems.push(`${locale}: interpolation mismatch at ${key}`)
      }
    }

    for (const key of Object.keys(dictionary)) {
      if (!Object.hasOwn(canonical, key)) {
        problems.push(`${locale}: extra key ${key}`)
      }
    }
  }

  return problems
}
