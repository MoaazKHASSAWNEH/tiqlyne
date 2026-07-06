---
sidebar_position: 6
---

# npm publication

This page is for release maintainers. Application users should follow [Installation](../start/installation.md) instead.

The public package names are `@tiqlyne/motion-core`, `@tiqlyne/motion-web`, and `@tiqlyne/motion-pack-basic`, all targeting version `0.1.0`.

Before publishing from this repository, authenticate with npm, confirm access to the `@tiqlyne` scope, and run the repository checks:

```bash
pnpm format
pnpm typecheck
pnpm test
pnpm build
```

Inspect each package tarball with `pnpm --filter <package-name> pack --dry-run` (or the equivalent supported by the installed pnpm version). Each manifest publishes only `dist`, with `dist/index.js` and `dist/index.d.ts` as the root export.

Publish in dependency order: core first, then Web and the basic pack. Replace workspace dependency ranges with valid registry ranges as part of the release workflow if the package manager does not rewrite `workspace:*` automatically. Publishing changes external state, so perform the actual `npm publish` only after the release owner approves the artifacts and tags.
