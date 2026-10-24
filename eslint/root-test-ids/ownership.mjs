import ts from "typescript"
import { imported } from "./bindings.mjs"
import { componentModules } from "./component-modules.mjs"

function unwrap(node) {
  while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression

  return node
}

export function domOwnership(context) {
  const ownsImport = componentModules(context, component)

  function component(node, { ast, local, importedComponent, activeComponents }) {
    node = unwrap(node)

    if (node && ts.isCallExpression(node) && /(?:^|\.)(?:memo|forwardRef)$/.test(node.expression.getText(ast))) {
      return component(node.arguments[0], { ast, local, importedComponent, activeComponents })
    }

    if (!node || !(ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) || !node.body) {
      return false
    }

    if (activeComponents.has(node)) return false
    activeComponents.add(node)

    const locals = new Map()
    const roots = []

    function bindName(name, initializer) {
      if (ts.isIdentifier(name)) locals.set(name.text, initializer)
      else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
        for (const entry of name.elements) {
          if (ts.isBindingElement(entry)) bindName(entry.name)
        }
      }
    }

    for (const parameter of node.parameters) {
      bindName(parameter.name)
      if (!ts.isObjectBindingPattern(parameter.name)) continue

      for (const entry of parameter.name.elements) {
        if (entry.initializer && ts.isIdentifier(entry.name) && entry.name.text === "asChild") {
          locals.set(entry.name.text, entry.initializer)
        }
      }
    }

    function collect(current) {
      if (current !== node && ts.isFunctionLike(current)) return
      if (ts.isReturnStatement(current) && current.expression) roots.push(current.expression)

      if (ts.isVariableDeclaration(current)) {
        const constant = current.parent.flags & ts.NodeFlags.Const

        bindName(current.name, constant ? current.initializer : undefined)
      }

      ts.forEachChild(current, collect)
    }

    function expression(value, tag = false, aliases = new Set()) {
      value = unwrap(value)
      if (!value || aliases.has(value)) return false
      aliases = new Set([...aliases, value])
      const follow = (next, isTag = tag) => expression(next, isTag, aliases)

      if (ts.isIdentifier(value)) {
        if (locals.has(value.text)) return follow(locals.get(value.text))
        if (tag && /^[a-z]/.test(value.text)) return true

        return tag && local(value.text)
      }

      if (ts.isPropertyAccessExpression(value) && tag && ts.isIdentifier(value.expression)) {
        if (locals.has(value.expression.text)) return false

        return importedComponent(value.expression.text, value.name.text)
      }

      if (ts.isStringLiteral(value)) return tag && /^[a-z]/.test(value.text)
      if (value.kind === ts.SyntaxKind.NullKeyword || value.kind === ts.SyntaxKind.FalseKeyword) return !tag

      if (ts.isConditionalExpression(value)) {
        const condition = ts.isIdentifier(value.condition) ? locals.get(value.condition.text) : value.condition

        if (condition?.kind === ts.SyntaxKind.FalseKeyword) return follow(value.whenFalse)
        if (condition?.kind === ts.SyntaxKind.TrueKeyword) return follow(value.whenTrue)

        return follow(value.whenTrue) && follow(value.whenFalse)
      }

      if (ts.isJsxElement(value) || ts.isJsxSelfClosingElement(value)) {
        const opening = ts.isJsxElement(value) ? value.openingElement : value
        const asChild = opening.attributes.properties.find((entry) => ts.isJsxAttribute(entry) && entry.name.text === "asChild")

        if (asChild && (!asChild.initializer || asChild.initializer.expression?.kind !== ts.SyntaxKind.FalseKeyword)) return false

        return follow(opening.tagName, true)
      }

      if (ts.isJsxFragment(value)) {
        const children = value.children.filter((child) => !ts.isJsxText(child) || child.text.trim())

        return children.length > 0 && children.every((child) => follow(ts.isJsxExpression(child) ? child.expression : child, false))
      }

      return false
    }

    if (ts.isBlock(node.body)) collect(node)
    else roots.push(node.body)

    const owns = roots.length > 0 && roots.every((root) => expression(root))

    activeComponents.delete(node)

    return owns
  }

  return (opening) => {
    const name = opening.name
    const identifier = name.type === "JSXMemberExpression" ? name.object : name
    const origin = imported(identifier, context.sourceCode)
    const exportedName = origin?.name === "*" && name.type === "JSXMemberExpression" ? name.property.name : origin?.name
    const asChild = opening.attributes.find((entry) => entry.type === "JSXAttribute" && entry.name.name === "asChild")

    if (asChild && asChild.value?.expression?.value !== false) return false
    if (name.type === "JSXMemberExpression" && origin?.name !== "*") return false

    return Boolean(origin && ownsImport(origin.source, exportedName, context.filename))
  }
}
