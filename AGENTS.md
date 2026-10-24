# Project rules

- Follow FSD: _app → _pages → widgets → features → entities → shared. Lower-layer imports only; explicit slice public APIs.
- One component per file, named props in adjacent types, maximum 200 lines including blanks, maximum six non-index files per FSD directory.
- Components render; interactions and state live in model hooks. HTTP server state belongs to TanStack Query; no automatic mutation retries.
- Use typed i18next/react-i18next. Only Russian currently ships; keep all product copy in the resource dictionary.
- Theme colors belong to _app/styles/tokens.css. Tailwind utilities consume semantic tokens. Support light and dark modes.
- Every component root and interactive/asserted element has a static imported test ID. Repeated rows use data-* identity attributes.
- Enforce physical component-root IDs and explicit test-ID provenance with the AST-based `frontend/root-test-ids` rule. Resolve imported constants through aliases/public barrels; reject runtime/local IDs and unverifiable rendered roots. Keep provider/headless composition exemptions tied to actual DOM ownership. Regression tests cover these contracts in the mandatory pre-commit unit suite.
- Tests use test-ID constants, never role/text/label/CSS queries. Product roles and labels remain accessible.
- Use named constants for test scenario inputs and expected UI values (titles, dates, times and identities). Share fixtures between input and assertion; use typed i18n for product copy. Never inline these values in fill/type calls or text/value assertions. ESLint enforces this for browser tests and colocated UI specs; technical strings such as HTTP methods, attributes, keyboard keys and test descriptions may remain inline.
- Unit tests live beside their subject in `__spec__/*.test.ts` (or `.tsx`). Do not create `tests/unit`; keep browser journeys in `tests/e2e` and deployed smoke checks in `tests/deployment`.
- No magic business numbers or strings in application logic, defaults, comparisons or scenarios. Define descriptive constants for times, dates, durations, HTTP statuses, error codes and initial draft values; reuse domain constants rather than duplicating them in UI. API errors expose semantic checks such as `isConflict`; features must not compare numeric HTTP statuses. Translation keys inside typed i18n calls, Tailwind classes, imports, routes, DOM attributes, object property names and ordinary index/identity arithmetic are technical syntax, not business constants. ESLint enforces domain defaults/date/time values and unexplained numbers; do not bypass it with inline disables.
- Delete obsolete components and their private stories/types/assets when replacing a UI; do not retain them solely to keep unused stories running.
- Every reusable component has stories. No assertion imports/calls in stories; play functions only interact.
- Keep stories and their private scenarios/helpers in an adjacent `stories/` directory, separate from production components. Group composed page scenarios under `ui/stories/`. Production modules must not import story-only files. ESLint enforces story/unit placement and story import boundaries; the complete staged pre-commit graph runs these rules through the blocking lint step.
- English comments/developer docs, LF. No secrets, real user data, commits or publication.
- Required checks: lint, lint:fsd, lint:structure, lint:react, format:check, knip, typecheck, test, build, build-storybook, test-storybook, test:e2e.

## CodeGraph

- This project uses CodeGraph. Always use `codegraph explore` (or codegraph_explore with this projectPath) before code searches or source reads to locate or understand code.
- After code changes run `codegraph sync .`; check `codegraph status .`. Keep generated DB, WAL and SHM files local and ignored.
- Decompose page layouts, forms and widgets into focused semantic components and reuse shared shadcn primitives. Never duplicate native button/input/select markup outside shared UI primitives.
- All Storybook sample text uses typed i18n resources. Run Storybook browser/a11y tests on mobile, tablet and desktop.
- ESLint requires logical block padding and maximum 140 columns. Use shared `cn` = `twMerge(clsx(...))`, with semantic multiline class groups.
- One stable typed fetch HTTP instance in shared/api; no Axios dependency without a concrete need; domain API modules reuse it. React Query owns server data; nontrivial UI drafts/selection use scoped Zustand stores per app/story.

<!-- antislop:start -->

## antislop

- Always use the installed antislop plugin for UI, copy, responsive layout, accessibility and code-comment review.
- Read the installed antislop core and relevant concern skills before reviewing. Respect session mode first, then ~/.config/antislop/settings.json.
- Vladimir selected after mode as his saved preference: audit the completed work, record prioritized numbered findings, and wait for his choice before fixing new audit findings.
- The current installation is /Users/vladimir/.codex/plugins/cache/anti-slop/antislop/3.2.22/skills; rediscover the installed version if it moves.
- antislop-code reviews comments only; functional code changes follow the normal implementation and test process.

<!-- antislop:end -->

- Zustand hooks accept a typed selector: `useSchedulerStore<T>(selector: (state: SchedulerState) => T): T`; hide context and `useStore` inside that hook. Export named one-line selector/action hooks from `model/selectors.ts`.

- Keep the explicit Steiger exceptions in `steiger.config.mjs`: documented Next `_app`/`_pages` aliases and `insignificant-slice` for booking-editor, delete-booking and booking-scheduler (user-approved separate workflow slices). Never wrap rules or filter diagnostics.

- Inline callbacks passed to React hooks use block bodies. Preserve return values in useMemo/useState initializers. Keep direct one-line Zustand selector hooks and their state selectors concise; do not apply a blanket arrow-body rule.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
