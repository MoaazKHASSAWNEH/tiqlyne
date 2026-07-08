# Tiqlyne Motion Engine

Framework-agnostic TypeScript motion engine for declarative UI animation, dynamic runtimes and builder-driven applications.

Current target version: `0.1.0`.

## Project status

Tiqlyne Motion Engine is preparing its first public pre-release. The public API is usable for early testing, but it may still evolve before `1.0.0`.

## Why Tiqlyne Motion Engine?

Tiqlyne Motion Engine is designed to keep animation logic independent from UI frameworks. The core package owns motion definitions, timelines, validation, planning and playback contracts. Runtime-specific packages can then connect those contracts to browsers, frameworks or other rendering targets.

## Packages

- `@tiqlyne/motion-core`: platform-independent engine, registry, timeline model, validation, planning and playback contracts.
- `@tiqlyne/motion-web`: browser driver based on the Web Animations API.
- `@tiqlyne/motion-pack-basic`: basic motion pack with `fade-in`, `fade-out` and `slide-in`.

## Installation

Browser projects usually install the core package, the web driver and the basic motion pack.

```bash
npm install @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

For non-browser use cases, install only the core package.

```bash
npm install @tiqlyne/motion-core
```

## Usage overview

Use `@tiqlyne/motion-core` for platform-independent timelines and engine contracts. Add `@tiqlyne/motion-web` when you need browser playback. Add `@tiqlyne/motion-pack-basic` when you want the first built-in motion definitions.

Typical setup:

1. Create a motion registry.
2. Register motion definitions.
3. Create an engine with a driver.
4. Play registered motions through the engine API.

## Development

Install dependencies from the repository root:

```bash
pnpm install
```

Main checks:

- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Package-only checks:

- `pnpm build:packages`
- `pnpm typecheck:packages`
- `pnpm test:packages`

Release check:

```bash
pnpm release:check
```

## Publishing

The manual npm publishing process is documented in `docs/publishing.md`.

## Project documents

- `CHANGELOG.md`: release notes.
- `CONTRIBUTING.md`: contribution guide.
- `SECURITY.md`: security policy.
- `docs/publishing.md`: manual npm publishing guide.

## Documentation

The Docusaurus documentation lives in `website/`.

## License

MIT.
