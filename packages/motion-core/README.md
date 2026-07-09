# @tiqlyne/motion-core

Platform-independent TypeScript core for Tiqlyne Motion Engine.

`@tiqlyne/motion-core` contains the engine contracts and runtime model that make Tiqlyne framework-agnostic. It owns motion definitions, registries, timelines, composition, validation, planning, diagnostics, playback contracts, sampling and inspection. It does **not** depend on the DOM, React, Angular, Vue, GSAP, CSS animations or the Web Animations API.

Use this package when you want animation logic that can be created, validated, inspected and tested without tying your code to a browser or UI framework.

## Installation

```bash
npm install @tiqlyne/motion-core
```

```bash
pnpm add @tiqlyne/motion-core
```

For browser playback, install the official Web driver too:

```bash
npm install @tiqlyne/motion-core @tiqlyne/motion-web
```

## What this package provides

| Area | Main exports | Purpose |
| --- | --- | --- |
| Engine | `createMotionEngine`, `DefaultMotionEngine` | Create a motion runtime around a driver and optional registry. |
| Registry | `DefaultMotionRegistry`, `MotionRegistry` | Register and resolve reusable named motion definitions. |
| Definitions | `BaseMotionDefinition`, `SchemaMotionDefinition`, `MotionDefinition` | Build reusable motions with typed options and validation. |
| Options | `defineMotionOptions`, `option`, `normalizeMotionOptions` | Describe, infer and validate motion options. |
| Timelines | `createMotionTimeline`, `createMotionTimelineBuilder` | Build direct timelines with tracks, steps, defaults, labels and stagger rules. |
| Composition | `createMotionComposition`, `compileMotionComposition` | Combine registered motions into a concrete timeline. |
| Validation | `validateMotionTimeline` | Catch structural issues before playback. |
| Planning | `createMotionExecutionPlan`, `scheduleMotionTimeline` | Normalize, order and schedule timeline execution. |
| Drivers | `MotionDriver`, `NoopMotionDriver`, `TestMotionDriver` | Execute or test planned motion without hard-coding a platform. |
| Playback | `MotionPlaybackController`, `MotionPlaybackResult` | Model playback status, events and results consistently. |
| Diagnostics | `MotionDiagnosticCodes`, diagnostic helpers | Explain validation, planning and playback issues. |
| Tooling | `sampleMotionTimeline`, `inspectMotionTimeline` | Build previews, tests, documentation examples and debugging tools. |

## Quick start without a browser

The core can plan and execute through a platform driver. For tests, examples or server-side analysis, use `NoopMotionDriver` or `TestMotionDriver`.

```ts
import {
  createMotionEngine,
  createMotionTimeline,
  DefaultMotionRegistry,
  NoopMotionDriver
} from '@tiqlyne/motion-core';

const registry = new DefaultMotionRegistry();

const motion = createMotionEngine<unknown>({
  registry,
  driver: new NoopMotionDriver()
});

const timeline = createMotionTimeline((timelineBuilder) => {
  timelineBuilder.defaults({ duration: 300, easing: 'ease-out', fill: 'both' });

  timelineBuilder.track('self', (track) => {
    track.step({}, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

await motion.playTimeline({}, timeline);
```

The same timeline model can later be executed in the browser with `@tiqlyne/motion-web`.

## Compose registered motions

Motion definitions can be registered once, then reused by name through compositions. This is useful for design systems, page builders, low-code runtimes and any application that stores animation behavior as structured data.

The example below assumes `@tiqlyne/motion-pack-basic` is installed and registered.

```ts
import {
  compileMotionComposition,
  createMotionComposition,
  DefaultMotionRegistry
} from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

const composition = createMotionComposition((compositionBuilder) => {
  compositionBuilder.defaults({ duration: 250, easing: 'ease-out', fill: 'both' });

  compositionBuilder.motion('fade-in', {
    options: { fromOpacity: 0, toOpacity: 1 }
  });

  compositionBuilder.motion('slide-in', {
    at: 120,
    options: { direction: 'bottom', distance: 24, fade: true }
  });
});

const timeline = compileMotionComposition(composition, { registry });
```

Register motion definitions before compiling a composition. The official `@tiqlyne/motion-pack-basic` package provides the first ready-to-use pack.

## Testing and tooling

The core package is intentionally testable without a browser:

- use `validateMotionTimeline` to verify timeline structure;
- use `createMotionExecutionPlan` to inspect resolved execution order;
- use `scheduleMotionTimeline` to see concrete timing;
- use `sampleMotionTimeline` to build previews or assertions at a specific time/progress;
- use `inspectMotionTimeline` to generate metadata for debugging or documentation;
- use `TestMotionDriver` to record driver calls in unit tests.

## What this package does not do

`@tiqlyne/motion-core` does not play animations on DOM elements by itself. It does not query elements, create browser `Animation` objects, attach framework lifecycle hooks or manage CSS classes. Those responsibilities belong to drivers or framework adapters.

For browser playback, use:

```bash
npm install @tiqlyne/motion-web
```

For ready-to-use named motions, use:

```bash
npm install @tiqlyne/motion-pack-basic
```

## Package boundaries

The core package should stay platform-neutral:

- no DOM APIs;
- no framework imports;
- no Web Animations API dependency;
- no CSS runtime dependency;
- no GSAP or animation-library dependency.

That separation keeps motion definitions reusable across applications, tests, previews, documentation, builders and future runtimes.

## Documentation

- Documentation website: <https://moaazkhassawneh.github.io/tiqlyne/>
- Getting started: <https://moaazkhassawneh.github.io/tiqlyne/docs/getting-started>
- Package boundaries: <https://moaazkhassawneh.github.io/tiqlyne/docs/architecture/package-boundaries>
- Public exports: <https://moaazkhassawneh.github.io/tiqlyne/docs/reference/public-exports>

## Versioning

This package is versioned independently from the other Tiqlyne packages. Do not assume that all `@tiqlyne/*` packages share the same version.

Before `1.0.0`, minor versions may still contain breaking API changes. Check the changelog and release notes when upgrading.

## License

MIT.
