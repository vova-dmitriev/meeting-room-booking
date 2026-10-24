# Component DOM root IDs

The rule checks uppercase component functions, default exports and memo/forwardRef callbacks. It follows conditional returns,
fragments and transparent context/Radix wrappers until reaching each physical DOM boundary. Intrinsic elements, local polymorphic
DOM aliases and Radix content/overlay primitives need an imported static ID. IDs on imported component roots are checked too.

Imported components with source-verified DOM ownership delegate root validation to their own implementation, checked separately.
TypeScript resolution follows component imports, aliases and public barrels to inspect returned JSX and const aliases. Unknown,
mutable, shadowed or cyclic boundaries stay transparent. Caller-supplied `asChild` also keeps child roots visible, unless it is
statically false. Explicit descendant IDs still receive provenance checks below a verified boundary. Context
providers, fragments, Radix Root/Portal and explicit asChild wrappers create no extra DOM root. The rule does not require IDs on
their wrapper syntax or every nested DOM descendant. Returned render calls that cannot be inspected produce a diagnostic.
Returned identifiers follow scoped const initializers and alias chains, including conditional JSX. Reassigned/mutable roots and
cyclic aliases produce a diagnostic; parameter/children passthrough and null remain valid for headless composition.
Every explicit `data-testid`, including nested interactive elements and story markup, also gets provenance validation. Finite
conditional choices may select imported static IDs; null/undefined branches are allowed only for optional non-root IDs. Physical
roots always require an ID in every branch. Root attributes receive one diagnostic rather than a second attribute-level report.

ESLint scope lookup rejects local/shadowed bindings. TypeScript module resolution follows project aliases and named/star barrel
re-exports, then checks the actual exported const initializer and each object member. Literal strings and static object members
are accepted; factories, getters, computed runtime keys and interpolated templates are rejected. Runtime mutations and exotic
module transforms are outside static analysis. A default static ID before a props spread remains valid for shared UI overrides.

The colocated `root-test-ids.fixtures.ts` module is an explicit Knip entry: lintText fixtures import its path inside source strings,
and the rule reads that real module through TypeScript resolution and the filesystem. There is no runtime JavaScript import.
