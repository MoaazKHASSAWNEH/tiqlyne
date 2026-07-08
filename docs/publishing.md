# Publishing Guide

This guide describes the manual release process for Tiqlyne Motion Engine npm packages.

## Packages

The first public pre-release targets:

- `@tiqlyne/motion-core`
- `@tiqlyne/motion-web`
- `@tiqlyne/motion-pack-basic`

## Prerequisites

- Node.js compatible with the workspace.
- pnpm installed.
- npm account with publish access to the `@tiqlyne` scope.
- Clean git working tree.
- Completed changelog entry.

## Pre-release checks

Run from the repository root:

```bash
pnpm install
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

Or use:

```bash
pnpm release:check
```

## Build output checks

The npm package output should not contain tests or source maps.

```bash
find packages -path "*/dist/*" \( -name "*.spec.js" -o -name "*.spec.d.ts" -o -name "*.test.js" -o -name "*.test.d.ts" -o -name "*.js.map" -o -name "*.d.ts.map" \) -print
```

Expected result: no output.

## Pack local tarballs

The repository currently pins pnpm `10.0.0`, so package dry-run flags may not be available. Use local pack commands instead:

```bash
pnpm pack:packages
```

This creates package tarballs in the package folders.

## Inspect tarballs

```bash
tar -tzf packages/motion-core/tiqlyne-motion-core-0.1.0.tgz
tar -tzf packages/motion-web/tiqlyne-motion-web-0.1.0.tgz
tar -tzf packages/motion-pack-basic/tiqlyne-motion-pack-basic-0.1.0.tgz
```

Each tarball should include only:

- `package/package.json`
- `package/README.md`
- `package/LICENSE`
- generated `package/dist/**`

It should not include:

- `src/**`
- `*.spec.*`
- `*.test.*`
- source maps, unless intentionally enabled
- internal documentation
- website files

## Verify workspace dependency rewriting

Before publishing dependent packages, verify that packed manifests use registry versions instead of workspace ranges.

```bash
tar -xOf packages/motion-web/tiqlyne-motion-web-0.1.0.tgz package/package.json | grep '@tiqlyne/motion-core' -A1
tar -xOf packages/motion-pack-basic/tiqlyne-motion-pack-basic-0.1.0.tgz package/package.json | grep '@tiqlyne/motion-core' -A1
```

Expected result: the dependency should resolve to `0.1.0`, not `workspace:*`.

## Publish manually

Publish in dependency order. Prefer `pnpm publish` from each package folder so workspace dependency metadata is handled by pnpm.

```bash
cd packages/motion-core
pnpm publish --access public

cd ../motion-web
pnpm publish --access public

cd ../motion-pack-basic
pnpm publish --access public
```

Alternatively, after inspecting the generated tarballs, publish the exact tarball files from the repository root:

```bash
npm publish packages/motion-core/tiqlyne-motion-core-0.1.0.tgz --access public
npm publish packages/motion-web/tiqlyne-motion-web-0.1.0.tgz --access public
npm publish packages/motion-pack-basic/tiqlyne-motion-pack-basic-0.1.0.tgz --access public
```

## After publication

- Verify each package page on npm.
- Install the packages in a clean test project.
- Create a git tag, for example `v0.1.0`.
- Create a GitHub release with the changelog summary.

## Rollback note

npm packages cannot be fully removed reliably once public consumers can install them. If a bad version is published, prefer publishing a patch version or using npm deprecation with a clear message.
