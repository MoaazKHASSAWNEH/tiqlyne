# Contributing

Thank you for your interest in Tiqlyne Motion Engine.

## Development setup

Use pnpm from the repository root.

```bash
pnpm install
```

## Quality checks

Run the full validation suite before opening a pull request:

```bash
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

Package-only checks are also available:

```bash
pnpm build:packages
pnpm typecheck:packages
pnpm test:packages
```

## Development rules

- Keep `@tiqlyne/motion-core` framework-agnostic.
- Do not import DOM, React, Angular, Vue, GSAP or browser-only APIs in the core package.
- Public imports should come from package entry points, not from internal `src` paths.
- Add tests for new motion definitions, validators, drivers, builders or playback behavior.
- Keep npm package output limited to generated `dist` files and required metadata.

## Public API changes

Before adding new public exports, decide whether the API is stable, advanced or experimental. Public exports should be documented and tested.
