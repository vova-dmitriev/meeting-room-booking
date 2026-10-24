import { binding, imported } from "./bindings.mjs"
import { localInitializer } from "./aliases.mjs"

function expressionRoots(node, visit, unsupported, sourceCode, seen = new Set()) {
  if (!node) return

  const follow = (expression) => expressionRoots(expression, visit, unsupported, sourceCode, seen)

  if (node.type === "JSXExpressionContainer") return follow(node.expression)
  if (node.type === "ConditionalExpression") {
    follow(node.consequent)
    follow(node.alternate)
  } else if (node.type === "LogicalExpression") {
    follow(node.left)
    follow(node.right)
  } else if (node.type === "ArrayExpression") node.elements.forEach(follow)
  else if (node.type === "JSXFragment") node.children.forEach(follow)
  else if (["TSAsExpression", "TSNonNullExpression", "ParenthesizedExpression"].includes(node.type)) follow(node.expression)
  else if (["JSXElement", "JSXSelfClosingElement"].includes(node.type)) visit(node)
  else if (node.type === "CallExpression") unsupported(node)
  else if (node.type === "Identifier") localInitializer(node, sourceCode, unsupported, follow, seen)
}

function intrinsicAlias(node, sourceCode, seen = new Set()) {
  if (!node || seen.has(node)) return false
  seen.add(node)
  if (node.type === "Literal") return typeof node.value === "string" && /^[a-z]/.test(node.value)
  if (node.type === "ConditionalExpression")
    return intrinsicAlias(node.consequent, sourceCode, seen) || intrinsicAlias(node.alternate, sourceCode, seen)
  if (node.type !== "JSXIdentifier" && node.type !== "Identifier") return false

  const declaration = binding(node, sourceCode)?.defs.find((definition) => definition.type === "Variable")?.node

  return declaration?.type === "VariableDeclarator" && intrinsicAlias(declaration.init, sourceCode, seen)
}

export function physicalRoots(expression, sourceCode, check, unsupported, ownsDom) {
  expressionRoots(
    expression,
    (element) => {
      const opening = element.type === "JSXElement" ? element.openingElement : element
      const name = opening.name
      const attributes = opening.attributes
      const id = attributes.find((attribute) => attribute.type === "JSXAttribute" && attribute.name.name === "data-testid")
      let physical = name.type === "JSXIdentifier" && (/^[a-z]/.test(name.name) || intrinsicAlias(name, sourceCode))

      if (name.type === "JSXIdentifier" && !physical && !imported(name, sourceCode)) {
        const definition = binding(name, sourceCode)?.defs[0]

        const localComponent =
          definition?.type === "FunctionName" ||
          (definition?.node?.type === "VariableDeclarator" && /FunctionExpression$/.test(definition.node.init?.type ?? ""))

        physical = !localComponent
      }

      if (name.type === "JSXMemberExpression") {
        const origin = imported(name.object, sourceCode)
        const headless = ["Root", "Portal"].includes(name.property.name)

        const asChild = attributes.some(
          (attribute) =>
            attribute.type === "JSXAttribute" &&
            attribute.name.name === "asChild" &&
            (!attribute.value || (attribute.value.type === "JSXExpressionContainer" && attribute.value.expression.value === true)),
        )

        physical = origin?.source === "radix-ui" && !headless && !asChild
      }

      if (physical || id) check(opening, id)

      if (!physical && !id && !ownsDom(opening) && element.type === "JSXElement") {
        element.children.forEach((child) => physicalRoots(child, sourceCode, check, unsupported, ownsDom))
      }
    },
    unsupported,
    sourceCode,
  )
}
