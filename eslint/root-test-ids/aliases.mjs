import { binding } from "./bindings.mjs"

export function localInitializer(identifier, sourceCode, unsupported, follow, seen) {
  const variable = binding(identifier, sourceCode)
  const definition = variable?.defs.find((entry) => entry.type === "Variable")

  if (!definition) {
    if (variable?.defs.some((entry) => entry.type === "Parameter") || identifier.name === "undefined") return
    unsupported(identifier)

    return
  }

  if (definition.node.parent.kind !== "const" || !definition.node.init || seen.has(variable)) {
    unsupported(identifier)

    return
  }

  seen.add(variable)
  follow(definition.node.init)
  seen.delete(variable)
}
