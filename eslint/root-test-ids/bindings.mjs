export function binding(identifier, sourceCode) {
  let scope = sourceCode.getScope(identifier)

  while (scope) {
    const value = scope.set.get(identifier.name)

    if (value) return value
    scope = scope.upper
  }

  return undefined
}

export function imported(identifier, sourceCode) {
  const definition = binding(identifier, sourceCode)?.defs.find((entry) => entry.type === "ImportBinding")

  if (!definition || definition.node.importKind === "type" || definition.parent.importKind === "type") return undefined

  const node = definition.node

  return {
    source: definition.parent.source.value,
    name: node.type === "ImportNamespaceSpecifier" ? "*" : node.type === "ImportDefaultSpecifier" ? "default" : node.imported.name,
  }
}

export function componentFunction(node) {
  if (node.type === "FunctionDeclaration") return /^[A-Z]/.test(node.id?.name ?? "") || node.parent?.type === "ExportDefaultDeclaration"

  let parent = node.parent

  while (parent?.type === "CallExpression") parent = parent.parent

  return (parent?.type === "VariableDeclarator" && /^[A-Z]/.test(parent.id.name ?? "")) || parent?.type === "ExportDefaultDeclaration"
}

export function returnExpressions(node, visitorKeys) {
  if (node.body.type !== "BlockStatement") return [node.body]

  const roots = []

  function visit(current) {
    if (current !== node && /^(?:ArrowFunctionExpression|FunctionExpression|FunctionDeclaration)$/.test(current.type)) return
    if (current.type === "ReturnStatement" && current.argument) roots.push(current.argument)

    for (const key of visitorKeys[current.type] ?? []) {
      const children = current[key]

      if (Array.isArray(children)) children.forEach((child) => child && visit(child))
      else if (children?.type) visit(children)
    }
  }

  visit(node)

  return roots
}
