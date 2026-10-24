# Visual regression baselines

The dedicated visual job compares four screenshots of the built Storybook: desktop workspace in light and dark themes, the desktop editor dialog, and the mobile workspace. Functional E2E excludes `tests/e2e/visual/`; project `testMatch` selects the three desktop cases and one mobile case without runtime skips.

Storybook supplies the fixed `DemoNow` clock and fresh MSW fixtures. Tests load its iframe directly, pass the theme global, wait for the seeded bookings and fonts, and open the editor through its create button. Application persistence and the production clock are outside this visual suite.

## Run the same environment as CI

Use Linux amd64, the bundled Chromium from Playwright 1.64.1, and the image's bundled fonts. The image includes Node 24. Do not substitute a system Chrome channel or generate Linux baselines on macOS.

```sh
npm run build-storybook
docker run --rm --platform linux/amd64 --ipc=host \
  -v "$PWD":/workspace \
  -v meeting-visual-node-modules:/workspace/node_modules \
  -w /workspace \
  mcr.microsoft.com/playwright:v1.64.1-noble@sha256:47b510dd9230bf0b9bfc9b20102241e577ea7a99334ab4c3ca19f19770e9b8ea \
  bash -c 'npm ci --ignore-scripts --no-audit --no-fund && npx playwright test --config playwright.visual.config.ts'
```

The config serves `storybook-static` on a private port, default `6007`. Set `STORYBOOK_VISUAL_PORT` to choose another port. Set `STORYBOOK_VISUAL_URL` only when an existing static Storybook server should be used. CI reuses the Storybook build artifact rather than rebuilding it in the visual job.

## Review and update

Missing images fail by default (`updateSnapshots: "none"`). A mismatch also fails. CI never accepts or writes new baselines.

1. Run the comparison in the pinned image and inspect the HTML report plus expected, actual, and diff images in the uploaded visual artifact.
2. For an intended UI change, rerun the same Docker command with `--update-snapshots=all` appended to the Playwright command.
3. Inspect every changed PNG in `tests/e2e/visual/__screenshots__/`, review it alongside the UI change, and include those PNGs in the change.
4. Rerun the normal comparison command in the same image. All four cases must pass without skipped cases before accepting the update.

Reports live in `playwright-report/visual`; actual images, diffs, error context, and retained failure traces live in `test-results/visual`. The CI job uploads both folders even when comparison fails. Open a downloaded report with `npx playwright show-report playwright-report/visual`.

Baselines are versioned source assets. Preserve them when cleaning generated reports. A Playwright, image, font, or rendering dependency upgrade requires the same explicit image review and comparison process.
