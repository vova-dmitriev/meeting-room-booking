# Review fixes implementation plan

**Goal:** Fix all five findings from the review of production tree `9faa85f`.

**Architecture:** Keep the existing FSD, TanStack Query, scoped Zustand and MSW design. Reconcile saved booking identities across cached days, preserve typed API validation errors, validate unknown mock payloads, and publish verified Vercel candidates before promoting production domains.

**Constraints:** The latest user request authorizes a reviewed PR, merge and production deployment after passing all checks. Preserve Moscow live time, complete local validation and selective CI E2E. Keep stories free of assertions. Work in the clean current checkout, whose tree matches deployed main.

## Tasks

- [x] Cache reconciliation: reproduce out-of-order cross-date saves; remove the saved ID from every cached day and refresh affected caches.
- [x] API errors: reproduce lost response codes; preserve known domain codes and display validation failures separately from transport failures.
- [x] Mock input contract: reproduce null/object-title payload failures; validate unknown JSON before storage and return 400 for malformed input.
- [x] Deployment transaction: test staged deployment URL parsing, candidate verification before promotion, and recovery after partial promotion.
- [x] Build reuse: publish the CI-built Storybook artifact, preserve the tested immutable application candidate through promotion, and remove redundant release builds where supported.
- [x] Follow-up: set GitHub About homepage to the deployed application; verify it through the repository API.
- [x] Follow-up: edit the complete README with no-ai-slop and expand dense enumerations; remove the prototype footer and obsolete component/key.
- [x] Follow-up: persist manual theme and apply it before first paint, with reload/blocked-hydration regressions.
- [x] Follow-up: persist the selected schedule day in `?date=YYYY-MM-DD`; preserve other URL state and restore browser history navigation.
- [x] Follow-up: use the schedule skeleton during mock API startup; retain actionable startup errors and remove visible startup copy.
- [x] Complete snapshot validation before the later persistence/navigation/visual follow-up.
- [x] Latest review: isolate visual tests; support workflow_dispatch release builds; update persistent-demo smoke; preserve editors across refetch and repeated history navigation; retain exact clock boundaries; catch storage access and validate persisted fields.
- [ ] Validate the final staged snapshot, merge the reviewed PR and verify both production surfaces.

## Verification

For each behavior change, run a failing regression before implementation and rerun it after the fix. Test release orchestration with an injected Vercel runner, including failures during candidate publication, verification, promotion and rollback. Run all required project checks and a fresh final review. Publish only CI-tested artifacts and verify candidates and production domains.

## Decisions

The user approved the concrete fixes in the preceding review. No additional product/design approval is needed. Runtime fixes and release orchestration have independent file ownership and may run in parallel. Root owns workflow, deployment scripts and README; application agents own cache/mock and error handling respectively.

## Evidence

- Cache/input boundary RED reproduced both bugs; 24 focused tests GREEN.
- API RED lost error codes and wrong feedback; 32 focused tests and 12 browser scenarios GREEN.
- Release RED missing transaction/build adapters and old alias selection; 39 release tests GREEN after implementation.
- Actual `vercel build --prod --standalone` in a temporary snapshot succeeded and created `.next/BUILD_ID` and `.vercel/output/config.json`; no deployment.
- Fresh read-only review of the five fixes found no P1/P2 findings.
- Initial complete snapshot before theme follow-up: source/security checks, 422 unit/integration tests, 216 Storybook cases, both builds and 297 E2E passed.
- Theme browser regressions cover saved light/dark, system fallback, blocked hydration frame capture, invalid/denied storage and Storybook isolation. Fresh reviewer found no P1/P2 findings.
- Date URL RED reproduced linked date loss; 21 browser checks and 431 unit tests GREEN. Fresh reviewer found no P1/P2 findings.
