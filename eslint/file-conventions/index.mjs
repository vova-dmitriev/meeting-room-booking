import { relative } from "node:path"

const storyImport = /(?:^|\/)stories(?:\/|$)|\.stories(?:\.[cm]?[jt]sx?)?$/
const browserOrIntegration = /^tests\/(e2e|deployment|integration)\//

const fileConventions = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      story: "Move Storybook stories and their private helpers into an adjacent stories/ directory.",
      unit: "Colocate unit tests beside their subject in __spec__/.",
      import: "Production modules must not import Storybook stories or their private helpers.",
    },
  },
  create(context) {
    const path = relative(context.cwd, context.filename).replaceAll("\\", "/")
    const segments = path.split("/")
    const story = segments.includes("stories")
    const test = segments.includes("__spec__") || browserOrIntegration.test(path)

    function checkImport(node, source) {
      if (!/^(src|app)\//.test(path) || story || test || typeof source !== "string") return
      if (storyImport.test(source)) context.report({ node, messageId: "import" })
    }

    return {
      Program(node) {
        if (/\.stories\.[cm]?[jt]sx?$/.test(path) && !story) context.report({ node, messageId: "story" })
        if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(path) && !test) context.report({ node, messageId: "unit" })
      },
      ImportDeclaration(node) {
        checkImport(node, node.source.value)
      },
      ExportNamedDeclaration(node) {
        checkImport(node, node.source?.value)
      },
      ExportAllDeclaration(node) {
        checkImport(node, node.source.value)
      },
      ImportExpression(node) {
        checkImport(node, node.source.value)
      },
    }
  },
}

export default fileConventions
