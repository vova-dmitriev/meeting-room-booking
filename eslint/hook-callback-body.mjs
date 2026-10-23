const hookPattern = /^use[A-Z]/

function reactImport(identifier, sourceCode) {
  if (identifier.type !== "Identifier") {
    return undefined
  }

  let scope = sourceCode.getScope(identifier)

  while (scope) {
    const binding = scope.set.get(identifier.name)

    if (binding) {
      const definition = binding.defs.find((entry) => entry.type === "ImportBinding" && entry.parent.source.value === "react")
      const specifier = definition?.node

      if (!specifier || specifier.importKind === "type" || definition.parent.importKind === "type") {
        return undefined
      }

      return specifier.type === "ImportSpecifier" ? (specifier.imported.name ?? specifier.imported.value) : "*"
    }

    scope = scope.upper
  }

  return undefined
}

function hookName(callee, sourceCode) {
  if (callee.type === "Identifier") {
    return reactImport(callee, sourceCode)
  }

  if (callee.type !== "MemberExpression") {
    return undefined
  }

  const namespace = reactImport(callee.object, sourceCode)

  if (namespace !== "*" && namespace !== "default") {
    return undefined
  }

  return callee.computed ? callee.property.value : callee.property.name
}

const rule = {
  meta: {
    type: "layout",
    schema: [],
    fixable: "code",
    messages: { block: "Use a block body for React hook callbacks; keep Zustand selectors concise." },
  },
  create(context) {
    const sourceCode = context.sourceCode

    return {
      CallExpression(node) {
        if (!hookPattern.test(hookName(node.callee, sourceCode))) {
          return
        }

        for (const callback of node.arguments) {
          if (callback.type !== "ArrowFunctionExpression" || !callback.expression) {
            continue
          }

          context.report({
            node: callback.body,
            messageId: "block",
            fix(fixer) {
              const arrow = sourceCode.getTokenBefore(callback.body, { filter: (token) => token.value === "=>" })
              const expression = sourceCode.text.slice(arrow.range[1], callback.range[1]).trim()

              // Parentheses preserve object/sequence values and comments after the arrow without return ASI.
              return fixer.replaceTextRange([arrow.range[1], callback.range[1]], ` {\nreturn (\n${expression}\n)\n}`)
            },
          })
        }
      },
    }
  },
}

export default rule
