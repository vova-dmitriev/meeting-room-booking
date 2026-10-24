import namedProps from "./named-props.mjs"
import hookCallbackBody from "./hook-callback-body.mjs"
import testDataConstants from "./test-data-constants.mjs"
import businessDataConstants from "./business-data-constants/index.mjs"
import fileConventions from "./file-conventions/index.mjs"
import rootTestIds from "./root-test-ids/index.mjs"

const config = {
  rules: {
    "root-test-ids": rootTestIds,
    "file-conventions": fileConventions,
    "business-data-constants": businessDataConstants,
    "test-data-constants": testDataConstants,
    "hook-callback-body": hookCallbackBody,
    "named-props": namedProps,
    "one-component": {
      meta: { type: "suggestion", schema: [], messages: { many: "One component per file. Move this component to its own UI file." } },
      create(context) {
        let count = 0
        const functions = new Set(["ArrowFunctionExpression", "FunctionExpression"])

        function record(node) {
          if (++count > 1) context.report({ node, messageId: "many" })
        }

        return {
          FunctionDeclaration(node) {
            if (/^[A-Z]/.test(node.id?.name ?? "")) record(node)
          },
          VariableDeclarator(node) {
            if (!/^[A-Z]/.test(node.id.name ?? "")) return
            const init = node.init

            if (!init) return

            const wrapped =
              init.type === "CallExpression" && ["memo", "forwardRef"].includes(init.callee.name ?? init.callee.property?.name)

            if (functions.has(init.type) || wrapped) record(node)
          },
          ExportDefaultDeclaration(node) {
            if (functions.has(node.declaration.type)) record(node)
          },
        }
      },
    },
  },
}

export default config
