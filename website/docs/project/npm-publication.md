---
sidebar_position: 6
---

# npm publication

This page is for release maintainers. Application users should follow [Installation](../start/installation.md) instead.

Tiqlyne packages are published independently under the `@tiqlyne` npm scope.

The public packages are:

- `@tiqlyne/motion-core`
- `@tiqlyne/motion-web`
- `@tiqlyne/motion-pack-basic`

The repository root is private and is not published to npm.

## Release workflow

Tiqlyne uses Changesets for package releases.

When a public package needs a release, create a changeset:

```bash
pnpm changeset
```

Select only the package or packages that should receive a version bump.

For repository-only changes that should not publish a package, create an empty changeset:

```bash
pnpm changeset add --empty
```

## Check the release plan

Before applying versions, inspect the planned bumps:

```bash
pnpm changeset status
```

The output should clearly show which packages will be bumped at patch, minor or major level.

## Apply versions

After the release plan is approved:

```bash
pnpm version:packages
```

Then update the lockfile if needed:

```bash
pnpm install --lockfile-only
```

Review all generated changes before publishing.

## Required checks

Before publishing, run:

```bash
pnpm release:check
```

Do not publish if formatting, type checking, tests or build fail.

## Artifact inspection

Create local package tarballs when you need to inspect the exact npm contents:

```bash
pnpm pack:packages
```

Then list generated tarballs:

```bash
find packages -maxdepth 2 -name "*.tgz" -print
```

Each published package should include its manifest, README, license and generated `dist` files only.

## Workspace dependency rewriting

Published package manifests must not contain workspace dependency ranges such as `workspace:*` or `workspace:^`.

Before publishing dependent packages, inspect their packed manifest:

```bash
tar -xOf path/to/package.tgz package/package.json | grep '@tiqlyne/motion-core' -A1
```

The dependency should be rewritten to a valid npm registry range.

## Publish

Publish only after approval:

```bash
pnpm publish:packages
```

This command publishes the packages selected by Changesets.

## Tags

Use package-specific tags for package-specific releases:

```txt
@tiqlyne/motion-pack-basic@0.2.0
```

Use explicit ecosystem tags only for broader project milestones:

```txt
tiqlyne-v0.2.0
```

Avoid plain global tags such as `v0.2.0` for single-package releases.
