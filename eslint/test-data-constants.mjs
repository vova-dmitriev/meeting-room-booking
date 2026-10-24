const textMethods = new Set([
  "fill",
  "type",
  "pressSequentially",
  "toContainText",
  "toHaveText",
  "toHaveValue",
  "toHaveValues",
  "toHaveAccessibleName",
  "toHaveAccessibleDescription",
  "toHaveTitle",
])

function isConstant(node) {
  let current = node.parent

  while (current) {
    if (current.type === "VariableDeclarator") return current.parent.kind === "const"
    if (!["Property", "ObjectExpression", "ArrayExpression", "TSAsExpression", "TSSatisfiesExpression"].includes(current.type)) return false
    current = current.parent
  }

  return false
}

function callArgument(node) {
  let argument = node

  while (argument.parent?.type === "ArrayExpression") argument = argument.parent

  return argument.parent?.type === "CallExpression" ? argument.parent : undefined
}

const testDataConstants = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: { inline: "Use a named test-data constant for UI input/expected values; use typed i18n for product copy." },
  },
  create(context) {
    const browserTest = /[/\\]tests[/\\](e2e|deployment)[/\\]/.test(context.filename)

    function check(node) {
      if (node.type === "Literal" && typeof node.value !== "string") return
      if (isConstant(node)) return
      const call = callArgument(node)
      const method = call?.callee.type === "MemberExpression" ? call.callee.property.name : undefined
      const dataHelper = call?.callee.type === "Identifier" && call.callee.name === "fillBooking" && call.arguments.indexOf(node) > 0
      const value = node.type === "Literal" ? node.value : node.quasis.map((part) => part.value.cooked).join("")
      const scenarioValue = browserTest && /^(?:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}(?:T.*)?)$/.test(value)

      if (textMethods.has(method) || dataHelper || scenarioValue) context.report({ node, messageId: "inline" })
    }

    return { Literal: check, TemplateLiteral: check }
  },
}

export default testDataConstants
