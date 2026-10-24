import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import ts from "typescript"
import { imported } from "./bindings.mjs"

function unwrap(node) {
  while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression

  return node
}

export function staticIds(context) {
  const cwd = context.cwd
  const config = ts.readConfigFile(resolve(cwd, "tsconfig.json"), ts.sys.readFile)
  const options = ts.parseJsonConfigFileContent(config.config ?? {}, ts.sys, cwd).options
  const sources = new Map()

  function moduleFile(name, importer) {
    return ts.resolveModuleName(name, importer, options, ts.sys).resolvedModule?.resolvedFileName
  }

  function source(file) {
    if (!sources.has(file)) {
      try {
        sources.set(file, ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true))
      } catch {
        sources.set(file, undefined)
      }
    }

    return sources.get(file)
  }

  function exported(file, name, members, seen = new Set()) {
    const identity = `${file}:${name}:${members.join(".")}`

    if (!file || seen.has(identity)) return false
    seen.add(identity)

    const ast = source(file)

    if (!ast) return false

    function value(node, remaining) {
      node = unwrap(node)

      if (!node) return false
      if (ts.isIdentifier(node)) return local(node.text, remaining)
      if (remaining.length === 0) return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
      if (!ts.isObjectLiteralExpression(node)) return false

      const property = node.properties.find((entry) => entry.name && entry.name.getText(ast).replace(/^['"]|['"]$/g, "") === remaining[0])

      if (property && ts.isPropertyAssignment(property)) return value(property.initializer, remaining.slice(1))
      if (property && ts.isShorthandPropertyAssignment(property)) return local(property.name.text, remaining.slice(1))

      return false
    }

    function local(identifier, remaining) {
      for (const statement of ast.statements) {
        if (!ts.isVariableStatement(statement) || !(statement.declarationList.flags & ts.NodeFlags.Const)) continue

        const declaration = statement.declarationList.declarations.find(
          (entry) => ts.isIdentifier(entry.name) && entry.name.text === identifier,
        )

        if (declaration) return value(declaration.initializer, remaining)
      }

      return false
    }

    for (const statement of ast.statements) {
      if (ts.isVariableStatement(statement) && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
        if (statement.declarationList.declarations.some((entry) => ts.isIdentifier(entry.name) && entry.name.text === name)) {
          return local(name, members)
        }
      }

      if (!ts.isExportDeclaration(statement)) continue

      const target = statement.moduleSpecifier && moduleFile(statement.moduleSpecifier.text, file)

      if (!statement.exportClause && target && exported(target, name, members, seen)) return true
      if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue

      const entry = statement.exportClause.elements.find((element) => element.name.text === name && !element.isTypeOnly)

      if (entry) {
        const original = (entry.propertyName ?? entry.name).text

        return target ? exported(target, original, members, seen) : local(original, members)
      }
    }

    return false
  }

  return (expression) => {
    const members = []

    while (expression?.type === "MemberExpression") {
      if (expression.computed && expression.property.type !== "Literal") return false
      members.unshift(expression.computed ? expression.property.value : expression.property.name)
      expression = expression.object
    }

    if (expression?.type !== "Identifier") return false

    const origin = imported(expression, context.sourceCode)

    if (!origin) return false

    const name = origin.name === "*" ? members.shift() : origin.name

    return exported(moduleFile(origin.source, context.filename), name, members)
  }
}
