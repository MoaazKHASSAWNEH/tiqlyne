---
sidebar_position: 6
---

# Versioning

Tiqlyne Motion Engine uses independent package versioning.

Each public npm package has its own version and can evolve at its own pace:

- `@tiqlyne/motion-core`
- `@tiqlyne/motion-web`
- `@tiqlyne/motion-pack-basic`

The repository root is private and does not represent a public package version.

## Why independent versions?

Tiqlyne is organized as a small ecosystem of focused packages.

Core, Web and motion packs do not always change together. For example, a new motion can be added to `@tiqlyne/motion-pack-basic` without changing `@tiqlyne/motion-core` or `@tiqlyne/motion-web`.

Independent versions keep releases precise:

```txt
@tiqlyne/motion-core          0.1.0
@tiqlyne/motion-web           0.1.0
@tiqlyne/motion-pack-basic    0.2.0
```

This avoids unnecessary package bumps and makes changelogs easier to read.

## Source of truth

The source of truth for public package versions is the package manifest of each published package:

```txt
packages/motion-core/package.json
packages/motion-web/package.json
packages/motion-pack-basic/package.json
```

Documentation pages that describe the current package set should use those package versions as the source of truth.

Historical pages, release notes and blog posts may keep the exact version they describe.

## Semantic versioning before 1.0.0

Tiqlyne follows semantic versioning principles.

Before `1.0.0`, the public API can still evolve:

- patch versions such as `0.1.x` are for compatible fixes;
- minor versions such as `0.2.0` can add features;
- minor versions may also contain breaking public API changes before `1.0.0`;
- breaking changes must be documented clearly in the relevant changelog.

After `1.0.0`, breaking public API changes should require a major version.

## Internal dependencies

Packages that depend on another Tiqlyne package should use workspace ranges during development.

For published packages, prefer:

```json
{
  "@tiqlyne/motion-core": "workspace:^"
}
```

This allows pnpm to rewrite workspace dependencies to valid npm ranges during publication while keeping compatibility boundaries clear.

## Changesets

Tiqlyne uses Changesets to manage package versioning and publication.

A changeset describes:

- which package changed;
- whether the change is patch, minor or major;
- the changelog summary for that package.

Create a changeset when a public package should be released:

```bash
pnpm changeset
```

For repository-only changes that should not release a package, use an empty changeset:

```bash
pnpm changeset add --empty
```

## GitHub releases and tags

Package-specific releases should use package-specific tags:

```txt
@tiqlyne/motion-pack-basic@0.2.0
@tiqlyne/motion-web@0.1.1
@tiqlyne/motion-core@0.2.0
```

Global ecosystem releases should be reserved for broader milestones and should use an explicit ecosystem tag:

```txt
tiqlyne-v0.2.0
```

Avoid using a plain `v0.2.0` tag for package-specific releases, because it suggests a single global repository version.

## Related pages

- [API stability](./api-stability.md)
- [npm publication](../project/npm-publication.md)
- [Release status](./status.md)
