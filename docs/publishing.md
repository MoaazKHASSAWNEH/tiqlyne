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

## Release safety rules

Follow these rules for every release:

- Do not publish from a dirty working tree.
- Do not run `pnpm version:packages` twice for the same changeset.
- Do not publish before the version PR is merged into `main`.
- Do not edit `website/src/data/packageVersions.ts` manually.
- Do not publish directly from package folders unless intentionally bypassing the Changesets workflow.
- Do not use a plain `vX.Y.Z` tag for a package-specific release.
- Do not assume that all packages must be released together.
- Verify packed tarballs before publishing.
- Verify npm after publishing in a clean project.

## Prerequisites

Before publishing, make sure you have:

- Node.js compatible with the workspace.
- pnpm installed.
- GitHub CLI installed and authenticated if you open PRs from the terminal.
- npm account with publish access to the `@tiqlyne` scope.
- Clean git working tree.
- A reviewed changeset for every public package release.
- Approval from the release owner.

Check npm authentication before publishing:

```bash
npm whoami --registry=https://registry.npmjs.org/
```

If this fails, log in before starting the publish step:

```bash
npm login --registry=https://registry.npmjs.org/ --auth-type=web
```

If the browser or passkey flow fails, use the legacy flow:

```bash
npm login --registry=https://registry.npmjs.org/ --auth-type=legacy
```

## Choosing version bumps

Use the smallest bump that accurately communicates the package impact.

Before `1.0.0`, Tiqlyne still uses semver intent:

| Change type | Recommended bump | Example |
| --- | --- | --- |
| Documentation-only package README update | `patch` | Better npm README for `@tiqlyne/motion-core` |
| Bug fix without public API change | `patch` | Fix reduced-motion handling in `@tiqlyne/motion-web` |
| New public feature or new motion | `minor` | Add `slide-out` to `@tiqlyne/motion-pack-basic` |
| Public export removal before `1.0.0` | `minor` | Remove an unused package version constant |
| Public API redesign before `1.0.0` | `minor` | Change core timeline contracts |

Dependent packages should only be bumped when their code, package README, compatibility, or public API actually changes.

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

README improved for @tiqlyne/motion-core
→ bump @tiqlyne/motion-core patch

Breaking core API change before 1.0.0
→ bump @tiqlyne/motion-core minor
→ bump dependent packages only if their code or compatibility changes
```

For infrastructure-only changes that do not require a package release, use an empty changeset:

```bash
pnpm changeset add --empty
```

Docs-only changes that do not affect a published package usually do not need a changeset.

## Feature PR workflow

Use this workflow for normal code or documentation changes that should later be published.

Start from `main`:

```bash
git checkout main
git pull
```

Create a feature branch:

```bash
git checkout -b feat/my-change
```

Make the code or documentation changes.

Add a changeset if a public package should be released:

```bash
pnpm changeset
```

Check the release plan:

```bash
pnpm changeset status
```

Run the full validation:

```bash
pnpm release:check
```

Commit and push:

```bash
git add .
git commit -m "feat: describe the change"
git push -u origin feat/my-change
```

Open a PR:

```bash
gh pr create \
  --base main \
  --head feat/my-change \
  --title "feat: describe the change" \
  --body "## Summary

- Describe the change
- Mention package impact

## Validation

- pnpm changeset status
- pnpm release:check"
```

Merge the feature PR only after CI is green and the changeset is correct.

## Version PR workflow

After the feature PR is merged, create a dedicated version PR. This keeps generated version and changelog changes separate from feature work.

Update `main`:

```bash
git checkout main
git pull
```

Create a release branch:

```bash
git checkout -b release/package-update
```

Inspect pending bumps:

```bash
pnpm changeset status
```

The output must match the intended release plan. Stop if the wrong package is listed or the wrong bump type appears.

Apply versions and changelogs:

```bash
pnpm version:packages
```

This command consumes pending changesets and updates package versions and generated changelogs.

Sync generated package version data for the documentation:

```bash
pnpm sync:versions
```

Refresh the lockfile if needed:

```bash
pnpm install --lockfile-only
```

Run the full validation:

```bash
pnpm release:check
```

Review generated files:

```bash
git status
git diff --stat
git diff
```

Expected generated changes usually include:

- package `package.json` version changes;
- package changelog updates;
- consumed `.changeset/*.md` deletion;
- `website/src/data/packageVersions.ts` update when versions changed;
- `pnpm-lock.yaml` update when needed.

Commit and push:

```bash
git add .
git commit -m "chore: version packages"
git push -u origin release/package-update
```

Open the version PR:

```bash
gh pr create \
  --base main \
  --head release/package-update \
  --title "chore: version packages" \
  --body "## Summary

- Apply Changesets package versions
- Update package changelogs
- Sync Docusaurus package version data
- Update lockfile if needed

## Validation

- pnpm changeset status
- pnpm sync:versions
- pnpm release:check"
```

Merge the version PR only after CI is green.

## Changelog rules

Changelogs are generated when running:

```bash
pnpm version:packages
```

Do not manually create release changelog entries before `pnpm version:packages`.

After the command runs, review generated changelogs for clarity. Small wording corrections are allowed in the version PR if they improve the release notes without changing the release meaning.

The changeset file is temporary. It documents an unreleased change. Once `pnpm version:packages` runs, the changeset is consumed and should be removed automatically.

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

Inspect each tarball manually:

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

Internal dependencies should be rewritten by pnpm to valid npm registry ranges, for example:

```txt
"@tiqlyne/motion-core": "^0.1.1"
```

## Publish packages

Publish only after the version PR has been merged into `main`, all checks are green, and tarballs have been inspected.

Update `main`:

```bash
git checkout main
git pull
```

Verify the working tree:

```bash
git status
```

Expected result:

```txt
nothing to commit, working tree clean
```

Verify that the target versions are not already published:

```bash
npm view @tiqlyne/motion-core@0.1.1 version
npm view @tiqlyne/motion-web@0.2.0 version
npm view @tiqlyne/motion-pack-basic@0.2.0 version
```

A `404` is expected for versions that are not published yet.

Publish with Changesets:

```bash
pnpm publish:packages
```

This publishes the packages selected by Changesets.

If npm requires an OTP, use the current authenticator code:

```bash
pnpm publish:packages --otp=123456
```

Replace `123456` with the real one-time code.

Do not publish directly from package folders unless intentionally bypassing the Changesets workflow.

## npm authentication troubleshooting

If publishing fails with `E401` or an invalid token message, clean the npm login state and log in again:

```bash
npm logout --registry=https://registry.npmjs.org/
npm config delete //registry.npmjs.org/:_authToken
npm config delete _authToken
npm config get registry
```

Expected registry:

```txt
https://registry.npmjs.org/
```

Log in again:

```bash
npm login --registry=https://registry.npmjs.org/ --auth-type=web
```

If the web login fails:

```bash
npm login --registry=https://registry.npmjs.org/ --auth-type=legacy
```

Verify the authenticated user:

```bash
npm whoami --registry=https://registry.npmjs.org/
```

Verify package ownership if needed:

```bash
npm owner ls @tiqlyne/motion-core
npm owner ls @tiqlyne/motion-web
npm owner ls @tiqlyne/motion-pack-basic
```

If publishing shows `E404 Not Found - PUT` after an authentication error, treat authentication or scope permission as the first thing to fix.

After fixing authentication, do not run `pnpm version:packages` again. Re-run only the publish command.

## Verify publication on npm

After publishing, check the latest versions:

```bash
npm view @tiqlyne/motion-core version
npm view @tiqlyne/motion-web version
npm view @tiqlyne/motion-pack-basic version
```

Check dependencies for packages that depend on the core package:

```bash
npm view @tiqlyne/motion-web@0.2.0 dependencies
npm view @tiqlyne/motion-pack-basic@0.2.0 dependencies
```

Check published READMEs:

```bash
npm view @tiqlyne/motion-core@0.1.1 readme | head -40
npm view @tiqlyne/motion-web@0.2.0 readme | head -40
npm view @tiqlyne/motion-pack-basic@0.2.0 readme | head -40
```

Use the release versions that were actually published.

## Test published packages in a clean project

Create a temporary test project:

```bash
cd /tmp
mkdir tiqlyne-publish-test
cd tiqlyne-publish-test
pnpm init
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

Verify package imports:

```bash
node -e "import('@tiqlyne/motion-core').then(m => console.log(Object.keys(m).slice(0, 10)))"
```

```bash
node -e "import('@tiqlyne/motion-web').then(m => console.log(Object.keys(m).slice(0, 10)))"
```

```bash
node -e "import('@tiqlyne/motion-pack-basic').then(m => console.log(Object.keys(m).slice(0, 10)))"
```

When a release removes a public export, verify that it is no longer exported:

```bash
node -e "import('@tiqlyne/motion-web').then(m => console.log('motionWebVersion' in m))"
```

```bash
node -e "import('@tiqlyne/motion-pack-basic').then(m => console.log('motionPackBasicVersion' in m))"
```

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

Check whether tags already exist:

```bash
git tag --list "*tiqlyne*"
```

If Changesets or the release flow created the tags locally, push them:

```bash
git push --follow-tags
```

If tags do not exist, create package-specific tags from the merged release commit:

```bash
git tag "@tiqlyne/motion-core@0.1.1"
git tag "@tiqlyne/motion-web@0.2.0"
git tag "@tiqlyne/motion-pack-basic@0.2.0"
```

Push the tags:

```bash
git push origin "@tiqlyne/motion-core@0.1.1" "@tiqlyne/motion-web@0.2.0" "@tiqlyne/motion-pack-basic@0.2.0"
```

Create GitHub releases:

```bash
gh release create "@tiqlyne/motion-core@0.1.1" \
  --title "@tiqlyne/motion-core 0.1.1" \
  --notes "Patch release with package fixes or documentation updates."
```

```bash
gh release create "@tiqlyne/motion-web@0.2.0" \
  --title "@tiqlyne/motion-web 0.2.0" \
  --notes "Minor pre-1.0 release with Web package updates."
```

```bash
gh release create "@tiqlyne/motion-pack-basic@0.2.0" \
  --title "@tiqlyne/motion-pack-basic 0.2.0" \
  --notes "Minor pre-1.0 release with basic motion pack updates."
```

Use the actual versions and release notes for the release being published.

## Clean up after publication

Remove local tarballs:

```bash
find packages -maxdepth 2 -name "*.tgz" -delete
```

Verify the working tree:

```bash
git status
```

Expected result:

```txt
nothing to commit, working tree clean
```

Optionally remove the temporary test project:

```bash
rm -rf /tmp/tiqlyne-publish-test
```

## Complete release checklist

Use this checklist for every package publication.

### Feature PR

- [ ] Start from updated `main`.
- [ ] Create a feature branch.
- [ ] Make the code or documentation change.
- [ ] Add a changeset when a public package should be released.
- [ ] Run `pnpm changeset status`.
- [ ] Run `pnpm release:check`.
- [ ] Open the feature PR.
- [ ] Merge only after CI is green.

### Version PR

- [ ] Start from updated `main` after the feature PR merge.
- [ ] Create a `release/...` branch.
- [ ] Run `pnpm changeset status` and verify the package bumps.
- [ ] Run `pnpm version:packages` once.
- [ ] Run `pnpm sync:versions`.
- [ ] Run `pnpm install --lockfile-only` if needed.
- [ ] Review package versions and changelogs.
- [ ] Run `pnpm release:check`.
- [ ] Open the version PR.
- [ ] Merge only after CI is green.

### Publication

- [ ] Update local `main` after the version PR merge.
- [ ] Confirm `git status` is clean.
- [ ] Run `pnpm release:check` if needed.
- [ ] Run `pnpm pack:packages`.
- [ ] Inspect tarballs with `tar -tzf`.
- [ ] Verify packed dependency ranges are not `workspace:*` or `workspace:^`.
- [ ] Verify npm authentication with `npm whoami`.
- [ ] Verify target versions are not already published.
- [ ] Run `pnpm publish:packages`.
- [ ] Use `--otp` if npm requires a one-time code.

### Post-publication

- [ ] Verify versions with `npm view`.
- [ ] Verify dependencies with `npm view ... dependencies`.
- [ ] Verify published READMEs with `npm view ... readme`.
- [ ] Install packages in a clean `/tmp` project.
- [ ] Verify package imports with `node -e`.
- [ ] Create or verify Git tags.
- [ ] Create or verify GitHub releases.
- [ ] Delete local tarballs.
- [ ] Confirm the repository is clean.

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
