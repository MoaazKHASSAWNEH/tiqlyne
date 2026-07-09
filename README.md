# Tiqlyne Motion Engine

Framework-agnostic TypeScript motion engine for declarative UI animation, dynamic runtimes, and builder-driven applications.

[![npm version @tiqlyne/motion-core](https://img.shields.io/npm/v/@tiqlyne/motion-core.svg?label=%40tiqlyne%2Fmotion-core)](https://www.npmjs.com/package/@tiqlyne/motion-core)
[![npm version @tiqlyne/motion-web](https://img.shields.io/npm/v/@tiqlyne/motion-web.svg?label=%40tiqlyne%2Fmotion-web)](https://www.npmjs.com/package/@tiqlyne/motion-web)
[![npm version @tiqlyne/motion-pack-basic](https://img.shields.io/npm/v/@tiqlyne/motion-pack-basic.svg?label=%40tiqlyne%2Fmotion-pack-basic)](https://www.npmjs.com/package/@tiqlyne/motion-pack-basic)
[![CI](https://github.com/MoaazKHASSAWNEH/tiqlyne/actions/workflows/ci.yml/badge.svg)](https://github.com/MoaazKHASSAWNEH/tiqlyne/actions/workflows/ci.yml)
[![Deploy documentation](https://github.com/MoaazKHASSAWNEH/tiqlyne/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/MoaazKHASSAWNEH/tiqlyne/actions/workflows/deploy-docs.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

📚 **Documentation:** [https://moaazkhassawneh.github.io/tiqlyne/](https://moaazkhassawneh.github.io/tiqlyne/)

[Documentation](https://moaazkhassawneh.github.io/tiqlyne/) · [npm packages](#packages) · [GitHub Releases](https://github.com/MoaazKHASSAWNEH/tiqlyne/releases) · [Changelog](./CHANGELOG.md) · [Contributing](./CONTRIBUTING.md) · [Security](./SECURITY.md)

---

## Overview

Tiqlyne Motion Engine is a TypeScript-first animation engine built around a clean separation of concerns. The core package is entirely platform-independent: it owns motion definitions, the timeline model, validation, planning, playback contracts, and diagnostics. Runtime-specific packages plug in as drivers that connect those contracts to a real rendering target — the browser DOM, a test harness, or any custom runtime.

This architecture makes Tiqlyne suitable for:

- Standard browser applications that need structured, reusable animations.
- Builder-driven and low-code/no-code platforms where motions are defined programmatically.
- Dynamic runtimes where animation behavior is resolved at runtime from data.
- UI component systems where animations must be composable and testable.
- Any environment where animation logic should not be locked into a specific framework.

---

## Why Tiqlyne?

Most animation libraries are tightly coupled to a specific framework, runtime, or rendering layer. This makes it hard to reuse animation definitions across contexts, test them independently, or drive them from external data.

Tiqlyne separates animation logic from its execution environment:

- **Declarative motion definitions** are data-like and framework-independent.
- **The timeline model** is platform-neutral and fully typed.
- **Drivers** are the only layer that touches the actual runtime (DOM, test, custom).
- **Motion packs** group reusable definitions and can be composed and extended.
- **Validation and diagnostics** work at the core level, before any driver runs.
- **The engine API** is the thin integration point between the timeline model and a driver.

The result is an animation system that can be used in any JavaScript/TypeScript environment, tested without a browser, and integrated into builder-driven workflows.

---

## What Tiqlyne is Not

Tiqlyne is not a drop-in replacement for GSAP, Framer Motion, or CSS animation utilities. It is a lower-level, architecture-first motion engine. Understanding what it does not provide helps set the right expectations:

- **No built-in React/Vue/Svelte hooks** — framework adapter packages are not included in the first public package set. Framework integration is planned for a future release.
- **No visual timeline editor** — Tiqlyne is a code-first engine. A builder interface is a long-term goal, not a current feature.
- **No GSAP driver** — only a Web Animations API driver is provided today.
- **No marketplace or community motion packs** — only `@tiqlyne/motion-pack-basic` exists today.
- **Not production-ready for high-stakes use** — Tiqlyne is still pre-`1.0.0`. The API may change before `1.0.0`.
- **No scroll-triggered or gesture-driven animations** — playback is controlled programmatically.

---

## Features

- **Framework-agnostic core** — no DOM, no React, no Angular, no Vue, no GSAP dependency in `@tiqlyne/motion-core`
- **Motion registry** — named motion definitions registered and resolved at runtime
- **Reusable motion definitions** — define motions once, use them by name from any timeline
- **Timeline model** — typed `MotionTimelineDefinition` with tracks, steps, defaults, labels, and stagger support
- **Timeline builder** — fluent `createMotionTimeline` API with track and step builders
- **Motion composition** — compose multiple named motions into a timeline with `createMotionComposition` + `compileMotionComposition`
- **Validation** — `validateMotionTimeline` catches structural errors before playback
- **Planning and scheduling** — `createMotionExecutionPlan` + `scheduleMotionTimeline` resolve the execution order
- **Playback contracts** — `MotionPlaybackController` and `MotionPlaybackResult` for consistent playback state management
- **Typed playback and engine events** — subscribe to controller-level events and engine-level lifecycle events
- **Diagnostics and inspection** — `inspectMotionTimeline` and sampling utilities for timeline introspection
- **Web Animations API driver** — `WebMotionDriver` connects the timeline model to DOM elements via the Web Animations API
- **Reduced-motion support** — `WebMotionDriver` accepts a `reducedMotion` option; the web package includes helpers for resolving and simplifying timelines based on user preferences
- **Basic motion pack** — `fade-in`, `fade-out`, and `slide-in` ready to use out of the box
- **TypeScript-first** — fully typed public API with inference for motion option schemas
- **ESM packages** — all packages are pure ES modules
- **Publicly available on npm** — all packages are published under the `@tiqlyne` scope

---

## Packages

Tiqlyne packages are versioned independently. Check the npm badges above or the package pages below for the latest published version of each package.

| Package                                                                                  | Description                                 |
| ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| [`@tiqlyne/motion-core`](https://www.npmjs.com/package/@tiqlyne/motion-core)             | Platform-independent engine core            |
| [`@tiqlyne/motion-web`](https://www.npmjs.com/package/@tiqlyne/motion-web)               | Browser driver using the Web Animations API |
| [`@tiqlyne/motion-pack-basic`](https://www.npmjs.com/package/@tiqlyne/motion-pack-basic) | Built-in motion definitions                 |

### `@tiqlyne/motion-core`

The engine core. Contains the registry, motion definitions, timeline model, builder, composition tools, validation, planning, scheduling, playback contracts, diagnostics, inspector, and sampler. No DOM dependency. Install this in any project that needs animation logic without a browser runtime.

**Key exports:** `createMotionEngine`, `DefaultMotionRegistry`, `createMotionTimeline`, `createMotionComposition`, `compileMotionComposition`, `validateMotionTimeline`, `inspectMotionTimeline`, `sampleMotionTimeline`, `BaseMotionDefinition`, `SchemaMotionDefinition`, `NoopMotionDriver`, `TestMotionDriver`

### `@tiqlyne/motion-web`

The official browser driver. Connects `@tiqlyne/motion-core` timelines to DOM elements via the Web Animations API. Includes keyframe and timing conversion, target resolution, conflict handling, stagger utilities, and reduced-motion helpers.

**Key exports:**

| Export                               | Description                                                           |
| ------------------------------------ | --------------------------------------------------------------------- |
| `WebMotionDriver`                    | Main browser driver — pass to `createMotionEngine`                    |
| `WebMotionPlaybackController`        | Playback controller implementation for Web Animations                 |
| `toWebKeyframes`                     | Converts timeline step keyframes to Web Animations API format         |
| `resolveWebTarget`                   | Resolves a single DOM element from a `MotionTargetReference`          |
| `resolveWebTargets`                  | Resolves multiple DOM elements from a `MotionTargetReference`         |
| `resolveWebTrackTargets`             | Resolves all targets across all timeline tracks                       |
| `resolveStaggerOffset`               | Computes stagger delay for a specific target index                    |
| `resolveWebReducedMotionDiagnostics` | Returns diagnostics describing reduced-motion impact                  |
| `resolveWebActiveExecutionPlan`      | Resolves the execution plan adapted for reduced-motion mode           |
| `resolveWebPlayableTimeline`         | Resolves the timeline variant to actually play under current settings |
| `simplifyWebTimeline`                | Returns a simplified timeline suitable for reduced-motion playback    |
| `createWebAnimationsFromTimeline`    | Creates Web Animations from a full timeline                           |
| `validateWebPlayableTimeline`        | Validates a timeline before Web Animations playback                   |
| `cancelWebAnimations`                | Cancels all active Web Animations on an element                       |
| `hasActiveWebAnimations`             | Returns whether an element has active Web Animations                  |

Use this package when your application runs in the browser and you want to play timelines on DOM elements. Most applications only need `WebMotionDriver` directly; the other exports support advanced scenarios such as custom reduced-motion handling, conflict resolution, and tooling integration.

### `@tiqlyne/motion-pack-basic`

The first built-in motion pack. Provides `fade-in`, `fade-out`, and `slide-in` motion definitions and a `registerBasicMotions` helper that registers them all into a registry at once.

**Key exports:** `registerBasicMotions`, `FadeInMotion`, `FadeOutMotion`, `SlideInMotion`

---

## Installation

**Full installation for browser projects:**

```bash
npm install @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

**Core-only installation (non-browser or custom driver):**

```bash
npm install @tiqlyne/motion-core
```

---

## Quick Start

The following example shows a complete browser setup: registry, web driver, basic motions, a motion composition, and a raw timeline.

```ts
import {
  createMotionEngine,
  createMotionComposition,
  compileMotionComposition,
  createMotionTimeline,
  DefaultMotionRegistry
} from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';

// 1. Create a motion registry and register built-in motions.
const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

// 2. Create the engine with a browser driver.
//    Pass reducedMotion to respect the user's accessibility preference.
const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }),
  defaults: {
    duration: 400,
    easing: 'ease-out',
    fill: 'both'
  }
});

// 3. Get a DOM element to animate.
const target = document.getElementById('my-element')!;

// 4a. Play a motion composition (named motions from the registry).
const composition = createMotionComposition((c) => {
  c.defaults({ duration: 300, easing: 'ease-out', fill: 'both' });

  c.motion('fade-in', {
    options: { fromOpacity: 0, toOpacity: 1 },
    defaults: { duration: 250 }
  });

  c.motion('slide-in', {
    at: 250,
    options: { direction: 'bottom', distance: 40, fade: false },
    defaults: { duration: 300 }
  });
});

const timeline = compileMotionComposition(composition, { registry });
await motion.playTimeline(target, timeline);

// 4b. Or play a raw timeline defined with the builder.
const rawTimeline = createMotionTimeline((t) => {
  t.defaults({ duration: 600, easing: 'ease-in-out', fill: 'both' });

  t.track('self', (track) => {
    track.step({ duration: 600 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

await motion.playTimeline(target, rawTimeline);
```

---

## Core Concepts

### Motion Definition

A motion definition is a reusable, named animation description. It declares what keyframes and options a motion produces. Definitions extend `BaseMotionDefinition` or `SchemaMotionDefinition` (which adds typed option schema validation). They are registered in a registry and referenced by name in compositions and timelines.

### Motion Registry

The `DefaultMotionRegistry` is a central store of named motion definitions. Registering a definition with a name makes it available for resolution by the composition compiler and the engine. `registerBasicMotions` from `@tiqlyne/motion-pack-basic` registers the built-in definitions.

### Timeline

The `MotionTimelineDefinition` is the core data model: a structured description of tracks, steps, defaults, labels, and stagger rules. It is entirely platform-independent. Build one with `createMotionTimeline` (fluent builder API) or derive one from a motion composition using `createMotionComposition` + `compileMotionComposition`.

### Driver

A driver is the only platform-specific part of the engine. It receives a scheduled timeline and plays it against a real target. `WebMotionDriver` targets DOM elements via the Web Animations API. `NoopMotionDriver` does nothing (useful for testing the planning layer). `TestMotionDriver` records calls without side effects.

### Playback

`motion.playTimeline(target, timeline)` returns a `MotionPlaybackResult`. Use `motion.createTimelinePlayback(target, timeline)` to get a `MotionPlaybackController` for explicit pause, resume, finish, and cancel control.

Playback controllers emit the following events via `MotionPlaybackEventTypes`: `start`, `statusChange`, `pause`, `resume`, `cancel`, `finish`, `skip`, `fail`, `seek`, `progress`, `playbackRateChange`, `directionChange`.

The engine itself emits higher-level events via `MotionEngineEventTypes`: `before-plan`, `plan`, `play`, `finish`, `cancel`, `skip`, `error`.

### Motion Packs

A motion pack is a collection of named motion definitions that can be registered into a registry with a single call. `@tiqlyne/motion-pack-basic` is the first official pack. Packs are composable: register multiple packs into the same registry.

### Reduced Motion and Accessibility

`WebMotionDriver` accepts a `reducedMotion` boolean option. When set to `true`, the driver uses the resolved reduced-motion strategy for the timeline. The `@tiqlyne/motion-web` package exposes `resolveWebReducedMotionDiagnostics`, `resolveWebActiveExecutionPlan`, `resolveWebPlayableTimeline`, and `simplifyWebTimeline` for advanced scenarios where specific steps should be simplified or skipped based on user preferences. See the [Accessibility and Reduced Motion](#accessibility-and-reduced-motion) section for details.

---

## Browser Usage

`@tiqlyne/motion-web` is the official browser driver. It:

- Translates `MotionTimelineDefinition` steps into Web Animations API `KeyframeEffect` instances.
- Resolves DOM element targets from typed `MotionTargetReference` values: `self` (root element), `child` (`data-motion-child` attribute), `selector` (CSS selector via `querySelector`), or `named` (`data-motion-name` attribute).
- Handles animation conflict strategies when multiple animations target the same element.
- Computes stagger offsets across multi-target tracks.
- Applies reduced-motion fallback strategies based on the `reducedMotion` option.

```ts
import { WebMotionDriver } from '@tiqlyne/motion-web';

const driver = new WebMotionDriver({
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
});
```

Pass the driver to `createMotionEngine`. The rest of the API (timelines, compositions, playback) is identical regardless of driver.

---

## Basic Motion Pack

`@tiqlyne/motion-pack-basic` provides three built-in motion definitions:

| Key        | Category | Description                                              | Options                                                                                                                               |
| ---------- | -------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `fade-in`  | entrance | Animates opacity from a start value to an end value      | `fromOpacity` (default: `0`), `toOpacity` (default: `1`)                                                                              |
| `fade-out` | exit     | Animates opacity from a start value down to an end value | `fromOpacity` (default: `1`), `toOpacity` (default: `0`)                                                                              |
| `slide-in` | entrance | Slides an element in from a direction with optional fade | `direction` (`left`\|`right`\|`top`\|`bottom`, default: `bottom`), `distance` in px (default: `24`), `fade` boolean (default: `true`) |

Register all three at once:

```ts
import { DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);
```

Or use the motion classes directly:

```ts
import { FadeInMotion, FadeOutMotion, SlideInMotion } from '@tiqlyne/motion-pack-basic';
```

---

## Accessibility and Reduced Motion

Animation should respect user preferences. The `WebMotionDriver` accepts a `reducedMotion` boolean that adapts playback for users who prefer reduced motion:

```ts
new WebMotionDriver({
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
});
```

The `@tiqlyne/motion-web` package provides the following helpers for advanced reduced-motion scenarios:

- `resolveWebReducedMotionDiagnostics` — returns diagnostics describing which steps are affected by reduced-motion mode
- `resolveWebActiveExecutionPlan` — resolves the execution plan adapted for the current reduced-motion setting
- `resolveWebPlayableTimeline` — resolves the timeline variant to actually play under current settings
- `simplifyWebTimeline` — returns a simplified timeline suitable for reduced-motion playback

This is a technical foundation for respecting `prefers-reduced-motion`. It does not guarantee full WCAG compliance automatically — the application is responsible for deciding how to use the information returned by these helpers.

---

## Documentation

| Resource              | Location                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------- |
| Documentation website | [https://moaazkhassawneh.github.io/tiqlyne/](https://moaazkhassawneh.github.io/tiqlyne/) |
| Documentation source  | [`website/`](./website/)                                                                 |
| Project docs          | [`docs/`](./docs/)                                                                       |
| Publishing guide      | [`docs/publishing.md`](./docs/publishing.md)                                             |
| Changelog             | [`CHANGELOG.md`](./CHANGELOG.md)                                                         |
| Contributing          | [`CONTRIBUTING.md`](./CONTRIBUTING.md)                                                   |
| Security              | [`SECURITY.md`](./SECURITY.md)                                                           |

---

## Project Status

Tiqlyne is in its first public pre-`1.0.0` release line. The public packages are published independently under the `@tiqlyne` scope.

- Package versions are independent; do not assume a single repository-wide npm version.
- The public API is usable for early testing and integration.
- CI (format, typecheck, build, test) and documentation deployment are active on every push to `main`.
- APIs may still evolve before `1.0.0`. Breaking changes will be documented in the relevant changelog.

---

## Versioning Policy

Tiqlyne Motion Engine follows [Semantic Versioning](https://semver.org/) principles with independent package versions.

Each public package has its own version:

- `@tiqlyne/motion-core`
- `@tiqlyne/motion-web`
- `@tiqlyne/motion-pack-basic`

Before `1.0.0`:

- Minor versions (`0.x.0`) may introduce breaking changes to the public API.
- Patch versions (`0.x.y`) address compatible fixes.
- All breaking changes are documented in [`CHANGELOG.md`](./CHANGELOG.md) or the relevant package changelog.

The repository root is private and does not represent a published npm package version.

Do not depend on unexported internal paths (e.g., `@tiqlyne/motion-core/src/...`). Only the top-level package entry points are part of the public API.

---

## Roadmap

No dates are committed. The following directions are planned for future releases:

- **Richer motion packs** — more built-in definitions for common UI patterns
- **More examples** — additional framework-agnostic and browser examples
- **Advanced timeline composition** — richer stagger, anchor, and sequencing primitives
- **Framework adapters** — thin integration helpers for React, Vue, Svelte, and similar
- **Builder-driven integration examples** — showing how to drive animations from external data sources
- **Improved diagnostics** — more actionable validation messages and performance tier reporting
- **API stabilization toward `1.0.0`** — stabilizing the public surface after early adopter feedback

---

## Development

Install dependencies from the repository root:

```bash
pnpm install
```

| Command                    | Description                                                               |
| -------------------------- | ------------------------------------------------------------------------- |
| `pnpm format:check`        | Check code formatting                                                     |
| `pnpm typecheck`           | Type-check all packages                                                   |
| `pnpm test`                | Run all tests                                                             |
| `pnpm build`               | Build all packages                                                        |
| `pnpm build:packages`      | Build only the three npm packages                                         |
| `pnpm typecheck:packages`  | Type-check only the three npm packages                                    |
| `pnpm test:packages`       | Test only the three npm packages                                          |
| `pnpm sync:versions`       | Regenerate documentation package versions from package manifests          |
| `pnpm sync:versions:check` | Verify documentation package versions are synced with package manifests   |
| `pnpm release:check`       | Full pre-release check, including version sync, format, typecheck, tests and build |

---

## Repository Structure

```
packages/
  motion-core/          @tiqlyne/motion-core — platform-independent engine core
  motion-web/           @tiqlyne/motion-web  — browser driver (Web Animations API)
  motion-pack-basic/    @tiqlyne/motion-pack-basic — built-in motion definitions
examples/
  vanilla/              Vanilla TypeScript browser example
website/                Docusaurus documentation site
docs/                   Project and publishing documentation
```

---

## Publishing

npm publishing is managed with Changesets and independent package versions. The full process is documented in [`docs/publishing.md`](./docs/publishing.md).

---

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before submitting a pull request. Run `pnpm release:check` locally before opening a PR.

---

## Security

Read [`SECURITY.md`](./SECURITY.md) for the security policy. Do not open a public GitHub issue for sensitive vulnerability reports.

---

## License

MIT — see [`LICENSE`](./LICENSE).
