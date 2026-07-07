# Tiqlyne Motion Engine

Framework-agnostic TypeScript motion engine for declarative UI animation, dynamic runtimes and builder-driven applications.

Current target version: `0.1.0`.

## Packages

- `@tiqlyne/motion-core`: platform-independent engine, registry, timeline model, validation, planning and playback contracts.
- `@tiqlyne/motion-web`: browser driver based on the Web Animations API.
- `@tiqlyne/motion-pack-basic`: basic motion pack with `fade-in`, `fade-out` and `slide-in`.

## Installation

Use your package manager to install the packages you need. Browser projects usually use the core package, the web package and optionally the basic pack.

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

## Documentation

The Docusaurus documentation lives in `website/`.

## License

MIT.
