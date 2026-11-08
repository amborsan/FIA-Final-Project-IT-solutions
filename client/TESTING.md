# Frontend tests

Run these commands from `client/`:

```powershell
npm test
npm run test:watch
npm run test:e2e
npm run lint
npm run build
npm run check:boundary
```

Install the browser once per machine: `npx playwright install chromium`.

Unit/component tests use Vitest, jsdom, Testing Library, user-event and jest-dom.
They live beside the component or context as `*.test.tsx`. Shared DOM cleanup is
in `src/test/setup.ts`. No API mock server or fake production data is introduced.

Playwright tests live in `e2e/`. The config starts/reuses only the frontend at
127.0.0.1:5173. The existing backend must already be running at the Vite proxy
target with its documented customer demo account and catalog. Missing backend
or demo data is a failing prerequisite, not silently skipped coverage. Test setup
never starts, seeds, resets or changes backend configuration. Login creates a
normal session. The cart test changes browser-local cart data and never checks out.
Browser contexts are isolated; no personal browser session is reused.

Coverage currently includes stock caps/totals/persistence, invalid saved cart
JSON, German loading text, keyboard error retry, persistent language selection,
360px menu navigation/overflow, shop-to-cart persistence, and customer login.
Tests are selective regression coverage, not exhaustive WCAG or role coverage.

`test-results/` and `playwright-report/` are ignored. Retained failure traces may
contain demo session information: inspect locally and do not commit/share them.

The app uses shadcn/ui (Radix) + Tailwind v4 for new UI. Existing project-owned
components remain in place. DaisyUI remains absent.

Dependency note: npm audit reported 10 moderate development-tool findings through
the existing ESLint/typescript-eslint/minimatch chain. No forced major-version
fix or downgrade was applied as part of the test setup.
