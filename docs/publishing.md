# Publishing Guide

This guide describes the release process for Tiqlyne Motion Engine npm packages.

Tiqlyne uses independent package versioning. Each public package has its own npm version and can be released without forcing all other packages to change.

## Public packages

The public npm packages are:

- `@tiqlyne/motion-core`
- `@tiqlyne/motion-web`
- `@tiqlyne/motion-pack-basic`

The repository root is private and does not represent a public npm package version.

## Versioning model

Tiqlyne uses Changesets to manage package releases.

Package versions are independent:

```txt
@tiqlyne/motion-core          can stay at 0.1.0
@tiqlyne/motion-web           can stay at 0.1.0
@tiqlyne/motion-pack-basic    can move to 0.2.0
```

Do not assume a single global Tiqlyne version for all npm packages.

## Source of truth

The source of truth for package versions is each public package manifest:

```txt
packages/motion-core/package.json
packages/motion-web/package.json
packages/motion-pack-basic/package.json
```

The generated documentation version file is:

```txt
website/src/data/packageVersions.ts
```

Do not edit it manually. Regenerate it with:

```bash
pnpm sync:versions
```

The root `package.json` is private and is not a published package.

## Prerequisites

Before publishing, make sure you have:

- Node.js compatible with the workspace.
- pnpm installed.
- npm account with publish access to the `@tiqlyne` scope.
- Clean git working tree.
- A reviewed changeset for every package release.
- Approval from the release owner.

## Creating a changeset

When a change affects a public package and should be released, create a changeset:

```bash
pnpm changeset
```

Select only the package or packages that should receive a version bump.

Examples:

```txt
New motion added to @tiqlyne/motion-pack-basic
→ bump @tiqlyne/motion-pack-basic only

Bug fix in @tiqlyne/motion-web
→ bump @tiqlyne/motion-web only

Breaking core API change before 1.0.0
→ bump @tiqlyne/motion-core minor
→ bump dependent packages only if their code or compatibility changes
```

For infrastructure-only changes that do not require a package release, use an empty changeset:

```bash
pnpm changeset add --empty
```

## Pre-release checks

Run from the repository root:

```bash
pnpm install
```

```bash
pnpm sync:versions:check
```

```bash
pnpm release:check
```

The release check verifies package version documentation sync, formatting, type checking, tests and builds.

## Check pending package bumps

Before applying versions, inspect the release plan:

```bash
pnpm changeset status
```

This should show exactly which packages will be bumped.

If no public package should be released, the status should show no packages to be bumped.

## Apply package versions

When the release plan is approved, apply the package version changes:

```bash
pnpm version:packages
```

This updates package versions and generated changelogs according to the pending changesets.

After that, refresh the generated documentation package versions:

```bash
pnpm sync:versions
```

Then refresh the lockfile if needed:

```bash
pnpm install --lockfile-only
```

Review the generated changes carefully before publishing.

## Build and test before publishing

Run:

```bash
pnpm release:check
```

Do not publish if version sync, formatting, type checking, tests or build fail.

## Build output checks

The npm package output should not contain tests or source maps.

```bash
find packages -path "*/dist/*" \( -name "*.spec.js" -o -name "*.spec.d.ts" -o -name "*.test.js" -o -name "*.test.d.ts" -o -name "*.js.map" -o -name "*.d.ts.map" \) -print
```

Expected result: no output.

## Pack local tarballs for inspection

Create local package tarballs:

```bash
pnpm pack:packages
```

This creates tarballs in the package folders.

Do not hard-code tarball versions in release documentation. Tarball names are derived from the current package versions.

## Inspect tarballs

List generated package tarballs:

```bash
find packages -maxdepth 2 -name "*.tgz" -print
```

Inspect a tarball manually:

```bash
tar -tzf path/to/package.tgz
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

Before publishing dependent packages, verify that packed manifests use registry ranges instead of workspace ranges.

Example:

```bash
tar -xOf path/to/package.tgz package/package.json | grep '@tiqlyne/motion-core' -A1
```

Expected result: public package tarballs should not contain `workspace:*` or `workspace:^`.

Internal dependencies should be rewritten by pnpm to valid npm registry ranges.

## Publish packages

Publish only after the release plan and artifacts are approved.

```bash
pnpm publish:packages
```

This publishes the packages selected by Changesets.

Do not publish directly from package folders unless intentionally bypassing the Changesets workflow.

## Git tags and GitHub releases

For package-specific releases, prefer package-specific tags:

```txt
@tiqlyne/motion-pack-basic@0.2.0
@tiqlyne/motion-web@0.1.1
@tiqlyne/motion-core@0.2.0
```

Global ecosystem releases are reserved for larger milestones where several packages or the overall project direction changes together.

Example global milestone tag:

```txt
tiqlyne-v0.2.0
```

Do not use a plain `v0.2.0` tag for a single package release, because it suggests that the whole repository shares one global version.

## After publication

After publishing:

- Verify each package page on npm.
- Install the packages in a clean test project.
- Verify documentation examples with the published package versions.
- Create or verify the appropriate GitHub release.
- Update release/status documentation if needed.

## Rollback note

npm packages cannot be fully removed reliably once public consumers can install them.

If a bad version is published, prefer one of the following:

- publish a patch version;
- deprecate the bad npm version with a clear message;
- document the issue in the relevant package changelog.
