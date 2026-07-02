# Structifyx Motion Engine - V1 Release Checklist

> Status: release preparation checklist.
> Scope: documentation, packaging, exports and validation.
> Last verified state before this checklist: `77f3beb docs(core): add tsdoc to engine factory and base definitions`.

## 1. Goal

Prepare Structifyx Motion Engine for a clean V1 or pre-V1 package release.

This checklist is intentionally focused on release readiness. It should not introduce new runtime features unless a release-blocking bug is found.

## 2. Release principle

```txt
V1 must be stable, documented, packaged and predictable.
Do not start V2 work before V1 release readiness is complete.
```

## 3. Current package state

Known current state:

```txt
root package: private true
root version: 0.1.0
@structifyx/motion-core: 0.1.0
@structifyx/motion-web: 0.1.0
@structifyx/motion-pack-basic: 0.1.0
```

Known packages:

```txt
packages/motion-core
packages/motion-web
packages/motion-pack-basic
examples/vanilla
```

## 4. Package publication decision

Decide which packages are publishable:

```txt
[ ] @structifyx/motion-core
[ ] @structifyx/motion-web
[ ] @structifyx/motion-pack-basic
```

Decide if the first release is:

```txt
[ ] 0.1.x pre-release style
[ ] 1.0.0 public V1
[ ] 1.0.0-beta.x beta release
```

Recommendation before public adoption:

```txt
Use a beta/pre-release if package metadata and examples are not yet fully audited.
```

## 5. Root package.json audit

Check:

```txt
[ ] name
[ ] version
[ ] private
[ ] description
[ ] scripts
[ ] packageManager
[ ] repository metadata if needed
[ ] license if needed
[ ] author if needed
```

Current root is private, which is normal for a monorepo root.

## 6. Package package.json audit

For each publishable package, check:

```txt
[ ] name
[ ] version
[ ] description
[ ] type
[ ] sideEffects
[ ] main
[ ] types
[ ] exports
[ ] files
[ ] scripts
[ ] dependencies
[ ] peerDependencies if needed
[ ] repository metadata if needed
[ ] license if needed
[ ] README presence if package will be published
```

Important export rule:

```txt
The package should expose intentional public APIs only.
```

## 7. Dist and declaration audit

Run:

```bash
pnpm clean
pnpm build
```

Then inspect:

```txt
[ ] packages/motion-core/dist/index.d.ts
[ ] packages/motion-core/dist/index.js
[ ] packages/motion-web/dist/index.d.ts
[ ] packages/motion-web/dist/index.js
[ ] packages/motion-pack-basic/dist/index.d.ts
[ ] packages/motion-pack-basic/dist/index.js
```

Check for:

```txt
[ ] missing exports
[ ] accidental internal exports
[ ] invalid paths
[ ] DOM types leaking from motion-core
[ ] generated declaration errors
```

## 8. Public exports audit

At minimum, verify these exports from `@structifyx/motion-core`:

```txt
createMotionEngine
MotionEngine
MotionEngineConfig
MotionDriver
MotionDefinition
BaseMotionDefinition
SchemaMotionDefinition
createMotionTimeline
MotionTimelineDefinition
createMotionComposition
compileMotionComposition
sampleMotionTimeline
inspectMotionTimeline
MotionPlaybackController
MotionPlaybackState
MotionPlaybackResult
MotionDiagnosticCodes
MotionDiagnosticSources
MotionPlaybackResultReasons
```

Useful commands:

```bash
grep -R "createMotionEngine" -n packages/motion-core/src/index.ts
grep -R "SchemaMotionDefinition" -n packages/motion-core/src/index.ts
grep -R "MotionDiagnosticCodes" -n packages/motion-core/src/index.ts
grep -R "MotionPlaybackResultReasons" -n packages/motion-core/src/index.ts
```

## 9. README checklist

Root README should explain:

```txt
[ ] what the engine is
[ ] package list
[ ] installation model
[ ] quickstart with Web driver
[ ] quickstart with basic pack
[ ] direct timeline example
[ ] composition example
[ ] playback controller example
[ ] sampler/inspector mention
[ ] validation commands
[ ] current status / pre-release notice
```

Package README files should explain:

```txt
[ ] package purpose
[ ] installation
[ ] minimal usage
[ ] public API summary
[ ] links to docs
```

## 10. CHANGELOG checklist

Create or update:

```txt
CHANGELOG.md
```

It should include:

```txt
[ ] current unreleased section
[ ] implemented core features
[ ] implemented web driver features
[ ] implemented basic pack features
[ ] documentation status
[ ] breaking changes if any
[ ] known limitations
```

## 11. Documentation checklist

Check these docs exist and are aligned:

```txt
[ ] docs/chatgpt-project-resume.md
[ ] docs/project-handoff.md
[ ] docs/developer-api-guide-current-status.md
[ ] docs/developer-api-guide.md
[ ] docs/complete-usage-guide.md
[ ] docs/version-roadmap-v1-v2-v3.md
[ ] docs/release-v1-checklist.md
[ ] docs/web-driver-quickstart.md
[ ] docs/writing-custom-motion-definition.md
[ ] docs/writing-custom-motion-driver.md
[ ] docs/motion-composition-api.md
[ ] docs/timeline-sampler-api.md
[ ] docs/playback-controller-behavior.md
[ ] docs/playback-state-api.md
[ ] docs/playback-seek-api.md
[ ] docs/engine-events-api.md
[ ] docs/skip-event-api.md
```

## 12. Pack test

For each publishable package:

```bash
cd packages/motion-core
pnpm pack
```

Repeat for:

```txt
packages/motion-web
packages/motion-pack-basic
```

Inspect packed contents:

```txt
[ ] dist included
[ ] package.json included
[ ] README included if required
[ ] no src files unless intentional
[ ] no tests unless intentional
[ ] no local-only files
```

## 13. Final validation commands

Before a release commit:

```bash
git status
pnpm format
pnpm test
pnpm typecheck
pnpm build
```

Expected current known baseline:

```txt
motion-core: 29 test files / 328 tests passed
motion-web: 12 test files / 159 tests passed
motion-pack-basic: 4 test files / 25 tests passed
examples/vanilla build OK
```

## 14. Release blockers

Block release if any of these are true:

```txt
[ ] motion-core imports DOM or browser APIs
[ ] build fails
[ ] typecheck fails
[ ] tests fail
[ ] package exports are broken
[ ] README examples do not compile conceptually
[ ] dist files are missing
[ ] package metadata is incomplete for publication
[ ] public API is still being renamed frequently
```

## 15. Next phase after release readiness

After release readiness is complete, choose one path:

```txt
Path A: publish beta/pre-release
Path B: finish README/changelog and keep local pre-release
Path C: freeze API and prepare V1.0.0
```

Do not start V2 features until one of these paths is decided.
