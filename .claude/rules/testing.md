---
paths:
  - "tests/**"
  - "utils/**"
  - "services/**"
---

# Testing rules

- Add tests for important logic: unit conversion, streak and average, quiet hours, interval validation, the reminder flow.
- Keep logic pure in `utils/` so it can be tested without a browser.
- Tests live in `tests/` and run on Vitest. `wxt/testing/fake-browser` provides in-memory storage and alarms.
- After every change run `npm run lint`, `npm run typecheck` and `npm test`.
- Fix failing tests before continuing. Do not delete or weaken a test to make it pass.
- Before marking a task done, check it in Chrome and Edge against `docs/TEST_PLAN.md`.
