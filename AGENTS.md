# Project rules

- Follow FSD: _app → _pages → widgets → features → entities → shared. Lower-layer imports only; explicit slice public APIs.
- One component per file, named props in adjacent types, maximum 200 lines including blanks, maximum six non-index files per FSD directory.
- Components render; interactions and state live in model hooks. HTTP server state belongs to TanStack Query; no automatic mutation retries.
- Use typed i18next/react-i18next. Only Russian currently ships; keep all product copy in the resource dictionary.
- Theme colors belong to _app/styles/tokens.css. Tailwind utilities consume semantic tokens. Support light and dark modes.
- Every component root and interactive/asserted element has a static imported test ID. Repeated rows use data-* identity attributes.
- Tests use test-ID constants, never role/text/label/CSS queries. Product roles and labels remain accessible.
- Every reusable component has stories. No assertion imports/calls in stories; play functions only interact.
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
