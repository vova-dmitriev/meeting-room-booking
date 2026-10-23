// Original supplied reference rules; keep their entries and precedence unchanged.
const referenceReadabilityRules = {
  "padding-line-between-statements": [
    "error",
    { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
    { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
    { blankLine: "always", prev: "*", next: ["multiline-expression", "multiline-const", "multiline-let", "block-like", "return"] },
    { blankLine: "always", prev: ["multiline-expression", "multiline-const", "multiline-let", "block-like"], next: "*" },
    { blankLine: "any", prev: "directive", next: "*" },
    { blankLine: "always", prev: "import", next: "*" },
    { blankLine: "any", prev: "import", next: "import" },
  ],
}

const [, ...referencePadding] = referenceReadabilityRules["padding-line-between-statements"]

export const readabilityRules = {
  "padding-line-between-statements": "off",
  "@stylistic/padding-line-between-statements": [
    "error",
    ...referencePadding,
    { blankLine: "always", prev: "*", next: ["export", "type", "interface"] },
    { blankLine: "always", prev: ["export", "type", "interface"], next: "*" },
  ],
}
