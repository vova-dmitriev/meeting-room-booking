const transparent = new Set([
  "Property",
  "ObjectExpression",
  "ArrayExpression",
  "TSAsExpression",
  "TSSatisfiesExpression",
  "UnaryExpression",
])

const domainFields = new Set(["date", "start", "end", "title"])
const geometry = new Set(["size", "width", "height", "viewBox", "strokeWidth", "r", "rx", "ry", "cx", "cy", "x", "y", "d", "style"])
const dateOrTime = /^(?:\d{4}-\d{2}-\d{2}(?:T.*)?|\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:[–-]\d{2}:\d{2})?)$/

function namedConstant(node) {
  let current = node.parent

  while (current) {
    if (current.type === "VariableDeclarator") return current.id.type === "Identifier" && current.parent.kind === "const"
    if (!transparent.has(current.type)) return false
    current = current.parent
  }

  return false
}

function name(node) {
  if (node?.type === "MemberExpression") return node.computed ? node.property.value : node.property.name

  return node?.name ?? node?.value
}

function domainContext(node) {
  let current = node

  while (["ArrayExpression", "TSAsExpression", "TSSatisfiesExpression"].includes(current.parent?.type)) current = current.parent
  const parent = current.parent

  if (parent?.type === "Property" && parent.value === current) return domainFields.has(name(parent.key))
  if (["AssignmentPattern", "AssignmentExpression"].includes(parent?.type)) return domainFields.has(name(parent.left))
  if (parent?.type === "BinaryExpression") return domainFields.has(name(parent.left === current ? parent.right : parent.left))

  return false
}

function iconGeometry(node) {
  let current = node.parent

  while (current && !["JSXAttribute", "VariableDeclarator", "ReturnStatement"].includes(current.type)) current = current.parent

  return current?.type === "JSXAttribute" && geometry.has(current.name.name)
}

function httpValue(node) {
  if (node?.type === "Literal") return typeof node.value === "number"

  return node?.type === "MemberExpression" && ["HttpStatus", "HttpStatusCode", "StatusCode"].includes(name(node.object))
}

function statusComparison(node) {
  if (node?.type !== "BinaryExpression") return false

  return (name(node.left) === "status" && httpValue(node.right)) || (name(node.right) === "status" && httpValue(node.left))
}

const businessDataConstants = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      inline: "Use a named business-data constant or configuration value.",
      status: "Use the API error's semantic getter in features instead of comparing HTTP status.",
    },
  },
  create(context) {
    const feature = /[/\\]src[/\\]features[/\\]/.test(context.filename)

    function check(node) {
      if (namedConstant(node) || node.parent?.type === "TSLiteralType") return

      if (node.type === "Literal" && typeof node.value === "number") {
        if (feature && statusComparison(node.parent)) return
        if (![0, 1].includes(node.value) && !iconGeometry(node)) context.report({ node, messageId: "inline" })

        return
      }

      if (node.type === "Literal" && typeof node.value !== "string") return
      if (node.type === "TemplateLiteral" && node.expressions.length) return
      const value = node.type === "Literal" ? node.value : node.quasis.map((part) => part.value.cooked).join("")

      if (dateOrTime.test(value) || domainContext(node)) context.report({ node, messageId: "inline" })
    }

    return {
      Literal: check,
      TemplateLiteral: check,
      BinaryExpression(node) {
        if (feature && statusComparison(node)) context.report({ node, messageId: "status" })
      },
    }
  },
}

export default businessDataConstants
