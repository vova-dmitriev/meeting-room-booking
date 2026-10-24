# Business data constants

`frontend/business-data-constants` applies to TypeScript in `src/` and `app/`, including stories. Colocated specifications are excluded.

The rule reports:

- Numeric literals outside named constant definitions, except structural `0`, `1` and `-1`.
- Static ISO date/date-time strings, clock times and clock-time ranges.
- Inline string values for `date`, `start`, `end` and `title` object fields, assignments, comparisons and parameter defaults.
- Feature-layer HTTP `status` comparisons against numbers or members of `HttpStatus`, `HttpStatusCode` or `StatusCode`. Features consume semantic API error getters; the API layer can implement those getters with named status constants.

Arrays and default parameters are inspected. A surrounding `const store = createStore(callback)` does not exempt values inside the call or callback. Direct named constant definitions, including object/array definitions and TypeScript `as const`/`satisfies` wrappers, are allowed. Arithmetic inside a named variable still requires named operands.

Technical strings such as translation keys, import paths, routes, HTTP methods, DOM attributes and discriminants are not classified as business values. Numeric TypeScript literal types and JSX geometry/style attributes are exempt. The geometry attributes are `size`, `width`, `height`, `viewBox`, `strokeWidth`, `r`, `rx`, `ry`, `cx`, `cy`, `x`, `y` and `d`.

This is a semantic value taxonomy, not a ban on every string or identifier. It does not infer runtime types or identify arbitrarily renamed HTTP status enums.
