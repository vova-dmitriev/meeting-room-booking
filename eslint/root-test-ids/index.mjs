import { componentFunction, returnExpressions } from "./bindings.mjs"
import { physicalRoots } from "./roots.mjs"
import { idValues } from "./values.mjs"
import { domOwnership } from "./ownership.mjs"

const rule = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      root: "DOM component roots require an imported static test ID.",
      id: "Test IDs must resolve to imported static constants; local and dynamic values are forbidden.",
      unresolved: "Cannot verify this returned render call. Expose the component's JSX root so its test ID can be checked.",
    },
  },
  create(context) {
    const isStaticId = idValues(context)
    const ownsDom = domOwnership(context)
    const rootAttributes = new WeakSet()
    const rootElements = new WeakSet()
    const attributes = []

    function inspect(node) {
      if (!componentFunction(node)) return

      for (const expression of returnExpressions(node, context.sourceCode.visitorKeys)) {
        physicalRoots(
          expression,
          context.sourceCode,
          (opening, id) => {
            if (rootElements.has(opening)) return
            rootElements.add(opening)
            if (id) rootAttributes.add(id)
            if (id?.value?.type === "JSXExpressionContainer" && isStaticId(id.value.expression)) return
            context.report({ node: opening, messageId: "root" })
          },
          (node) => context.report({ node, messageId: "unresolved" }),
          ownsDom,
        )
      }
    }

    return {
      FunctionDeclaration: inspect,
      FunctionExpression: inspect,
      ArrowFunctionExpression: inspect,
      JSXAttribute(node) {
        if (node.name.name === "data-testid") attributes.push(node)
      },
      "Program:exit"() {
        for (const attribute of attributes) {
          if (rootAttributes.has(attribute)) continue
          if (attribute.value?.type === "JSXExpressionContainer" && isStaticId(attribute.value.expression, true)) continue
          context.report({ node: attribute, messageId: "id" })
        }
      },
    }
  },
}

export default rule
