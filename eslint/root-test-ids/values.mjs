import { binding } from "./bindings.mjs"
import { staticIds } from "./static-ids.mjs"

export function idValues(context) {
  const importedId = staticIds(context)

  return (expression, optional = false) => {
    let identified = false

    function branch(node) {
      if (!node) return false
      if (node.type === "ConditionalExpression") return branch(node.consequent) && branch(node.alternate)

      if (importedId(node)) {
        identified = true

        return true
      }

      const absent = node.type === "Literal" && node.value === null
      const undefinedValue = node.type === "Identifier" && node.name === "undefined" && !binding(node, context.sourceCode)?.defs.length

      return optional && (absent || undefinedValue)
    }

    return branch(expression) && identified
  }
}
