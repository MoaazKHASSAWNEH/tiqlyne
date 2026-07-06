---
sidebar_position: 4
---

# Testing

This page is for maintainers and contributors validating repository changes.

Run the complete test suite from the repository root:

```bash
pnpm test
```

Run type checking separately:

```bash
pnpm typecheck
```

Package-scoped examples:

```bash
pnpm --filter @tiqlyne/motion-core test
pnpm --filter @tiqlyne/motion-web test
pnpm --filter @tiqlyne/motion-pack-basic test
```

Use `TestMotionDriver` for deterministic core integrations and `NoopMotionDriver` for intentionally skipped execution. Browser-driver behavior is covered by its package tests.
