const prefix = "runtime"

export const RootTestId = { Root: "root-contract", Other: "root-contract-other" } as const

export const RootId = "root-contract-scalar"

export const DynamicTestId = { Root: `${prefix}-${Date.now()}` }

export const GetterTestId = {
  get Root() {
    return prefix
  },
}

export function FactoryTestId() {
  return prefix
}
