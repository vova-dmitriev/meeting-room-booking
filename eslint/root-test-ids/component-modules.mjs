import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import ts from "typescript"

export function componentModules(context, evaluate) {
  const config = ts.readConfigFile(resolve(context.cwd, "tsconfig.json"), ts.sys.readFile)
  const options = ts.parseJsonConfigFileContent(config.config ?? {}, ts.sys, context.cwd).options
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

  function exported(file, name, seen) {
    const identity = `${file}:${name}`

    if (!file || file.endsWith(".d.ts") || seen.has(identity)) return false
    const ast = source(file)

    if (!ast) return false
    seen = new Set([...seen, identity])
    const activeComponents = new Set()

    function local(identifier) {
      for (const statement of ast.statements) {
        if (ts.isFunctionDeclaration(statement) && statement.name?.text === identifier)
          return evaluate(statement, { ast, local, importedComponent, activeComponents })
        if (!ts.isVariableStatement(statement)) continue
        const declaration = statement.declarationList.declarations.find((entry) => entry.name.getText(ast) === identifier)

        if (declaration) return evaluate(declaration.initializer, { ast, local, importedComponent, activeComponents })
      }

      return importedComponent(identifier)
    }

    function importedComponent(identifier, member) {
      for (const statement of ast.statements) {
        if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly) continue
        const clause = statement.importClause
        const bindings = clause?.namedBindings
        const entry = bindings && ts.isNamedImports(bindings) && bindings.elements.find((item) => item.name.text === identifier)
        const namespace = bindings && ts.isNamespaceImport(bindings) && bindings.name.text === identifier
        const original = entry ? (entry.propertyName ?? entry.name).text : clause?.name?.text === identifier ? "default" : undefined
        const target = moduleFile(statement.moduleSpecifier.text, file)

        if (original && !member) return exported(target, original, seen)

        if (namespace && member) {
          if (statement.moduleSpecifier.text === "radix-ui") return !["Root", "Portal"].includes(member)

          return exported(target, member, seen)
        }
      }

      return false
    }

    for (const statement of ast.statements) {
      if (ts.isFunctionDeclaration(statement) && statement.modifiers?.some((item) => item.kind === ts.SyntaxKind.ExportKeyword)) {
        const exportedName = statement.modifiers.some((item) => item.kind === ts.SyntaxKind.DefaultKeyword)
          ? "default"
          : statement.name?.text

        if (exportedName === name) return evaluate(statement, { ast, local, importedComponent, activeComponents })
      }

      if (ts.isVariableStatement(statement) && statement.modifiers?.some((item) => item.kind === ts.SyntaxKind.ExportKeyword)) {
        if (statement.declarationList.declarations.some((entry) => entry.name.getText(ast) === name)) return local(name)
      }

      if (ts.isExportAssignment(statement) && name === "default") {
        return ts.isIdentifier(statement.expression)
          ? local(statement.expression.text)
          : evaluate(statement.expression, { ast, local, importedComponent, activeComponents })
      }

      if (!ts.isExportDeclaration(statement) || statement.isTypeOnly) continue
      const target = statement.moduleSpecifier && moduleFile(statement.moduleSpecifier.text, file)

      if (!statement.exportClause && target && exported(target, name, seen)) return true
      if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue
      const entry = statement.exportClause.elements.find((item) => item.name.text === name && !item.isTypeOnly)

      if (entry)
        return target ? exported(target, (entry.propertyName ?? entry.name).text, seen) : local((entry.propertyName ?? entry.name).text)
    }

    return false
  }

  return (module, name, importer) => exported(moduleFile(module, importer), name, new Set())
}
