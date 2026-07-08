# Tiqlyne Motion Engine

Framework-agnostic TypeScript motion engine for declarative UI animation, dynamic runtimes and builder-driven applications.

Current target version: `0.1.0`.

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

## Development

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

## Documentation

The Docusaurus documentation lives in `website/`.

## License

MIT.
