# Meeting room booking

Interactive frontend prototype with Russian localization, a shadcn UI kit and a replaceable mock API. No hosted backend is required.

## Run

Use Node.js 24 from `.nvmrc` and npm.

```sh
npm ci
npx playwright install chrome
npm run security:install-hooks
npm run storybook
```

Open <http://127.0.0.1:6006/?path=/story/preview-booking-workspace--default>. UI Kit contains reusable primitives; Business rules contains individual validation and recovery scenarios. The preview uses synthetic records and a fixed local clock on 23 October 2026, with explicit per-story overrides for past-time cases.

Run the Next.js preview separately with `npm run dev`. MSW starts before the booking workspace mounts. Data lives in memory and resets when the mock handlers restart; the prototype does not persist bookings between reloads.

## Structure

Thin Next.js routes in `app` delegate to FSD layers in `src`: `_app`, `_pages`, `widgets`, `features`, `entities`, `shared`. Pages compose focused components. Shared UI wraps shadcn primitives and merges class overrides through `cn` (`clsx` and `tailwind-merge`).

`shared/api` exposes one typed native-fetch client. Entity APIs encapsulate endpoints; TanStack Query owns server state. MSW intercepts the same transport used by the application. Replacing the mock with a real API requires configuring that transport and matching its contract, without embedding requests in UI.

Zustand stores own local drafts and selection. Each mounted workspace/editor has an isolated store. Typed scoped adapters accept a selector; named selector/action hooks live in each model's `selectors.ts`. Actions are defined inside the store creator.

Translations are grouped under `common`, `navigation`, `workspace`, `room`, `booking`, `calendar` and `demo`. Typed i18next keys cover components, stories and demo records. Locale validation compares recursive keys and interpolation placeholders against Russian.

## Checks

```sh
npm test
npm run test-storybook
npm run test:e2e
npm run check:i18n
npm run build
npm run build-storybook
npm run check:working-copy
```

Storybook browser/accessibility tests and Playwright E2E run on mobile, tablet and desktop. Stories use interactions to demonstrate states; assertions live in tests. Unit tests cover interval validation, UI-store transitions, time availability and tooling behavior; integration tests exercise the real HTTP client with MSW.

`check:working-copy` validates an isolated source snapshot. The installed pre-commit hook validates the complete staged snapshot, including build, tests, lint, i18n, security and React Doctor. It neither stages files nor creates commits. Checks use bounded parallel branches; dependent builds and browser tests run in order. GitHub Actions calls the same snapshot command. Gitleaks and a running Docker daemon are required for security scans; see [SECURITY.md](SECURITY.md).

Planning documents in `docs/plans` and `docs/specs`, reports, generated outputs and CodeGraph databases stay local. The repository uses CodeGraph before code exploration and refreshes its index after changes. The reusable setup skill is installed locally as `nextjs-fsd-quality-kit`.
