# @tiqlyne/motion-web

Official browser driver for Tiqlyne Motion Engine.

`@tiqlyne/motion-web` connects the platform-independent timeline model from `@tiqlyne/motion-core` to real DOM elements through the Web Animations API. It is the runtime package you use when your application needs to play Tiqlyne timelines in the browser.

Most applications only need `WebMotionDriver`. The package also exports lower-level helpers for advanced integrations, custom tooling, diagnostics, target resolution, reduced-motion handling and conflict strategies.

## Installation

```bash
npm install @tiqlyne/motion-core @tiqlyne/motion-web
```

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web
```

For ready-to-use motions, install the official basic pack too:

```bash
npm install @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

## What this package provides

| Area | Main exports | Purpose |
| --- | --- | --- |
| Driver | `WebMotionDriver` | Plays Tiqlyne timelines on DOM elements with the Web Animations API. |
| Controller | `WebMotionPlaybackController` | Wraps browser animations with a Tiqlyne playback controller contract. |
| Target resolution | `resolveWebTarget`, `resolveWebTargets`, `resolveWebTrackTargets` | Resolve typed target references to DOM elements. |
| Timing conversion | `toWebStepTimingOptions`, `toWebScheduledTaskTimingOptions` | Convert Tiqlyne timing options to Web Animations API options. |
| Keyframe conversion | `toWebKeyframes` | Convert Tiqlyne keyframes into browser-compatible keyframes. |
| Animation creation | `createWebAnimationFromStep`, `createWebAnimationsFromScheduledTask`, `createWebAnimationsFromTimeline` | Build browser `Animation` objects from scheduled timelines. |
| Reduced motion | `resolveWebPlayableTimeline`, `simplifyWebTimeline`, `resolveWebReducedMotionDiagnostics` | Adapt timelines when reduced motion is requested. |
| Conflicts | `getEffectiveWebConflictStrategy`, `cancelWebAnimations`, `hasActiveWebAnimations` | Handle existing animations on the same target. |
| Validation | `validateWebPlayableTimeline`, `shouldValidateWebPlayableTimeline` | Validate a timeline before browser playback. |

## Quick start with a direct timeline

You can play a raw timeline without any motion pack:

```ts
import { createMotionEngine, createMotionTimeline } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver(),
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});

const timeline = createMotionTimeline((timelineBuilder) => {
  timelineBuilder.track('self', (track) => {
    track.step({}, (step) => {
      step.from({ opacity: 0, transform: 'translateY(16px)' });
      step.to({ opacity: 1, transform: 'translateY(0)' });
    });
  });
});

const element = document.querySelector<HTMLElement>('[data-card]');

if (element) {
  await motion.playTimeline(element, timeline);
}
```

For named motion types like `fade-in` or `slide-in`, register a motion pack first.

## Complete browser setup with the basic pack

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }),
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});

await motion.play(document.body, {
  id: 'page-enter',
  type: 'slide-in',
  trigger: 'manual',
  options: {
    direction: 'bottom',
    distance: 24,
    fade: true
  }
});
```

## Target resolution

The Web driver resolves Tiqlyne target references against DOM elements. This allows a timeline to stay declarative while the driver handles runtime lookup.

Common target patterns include:

| Target reference | Typical use |
| --- | --- |
| `self` | Animate the root element passed to playback. |
| `child` | Resolve descendants marked with `data-motion-child`. |
| `named` | Resolve descendants marked with `data-motion-name`. |
| `selector` | Resolve descendants with a CSS selector. |

Use target references when building timelines that animate multiple elements from one root container.

## Reduced motion

`WebMotionDriver` accepts a `reducedMotion` boolean. Applications should provide the current user preference, usually from `matchMedia('(prefers-reduced-motion: reduce)')`.

```ts
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const driver = new WebMotionDriver({
  reducedMotion: prefersReducedMotion
});
```

The driver can skip, simplify or preserve motion depending on the configured reduced-motion strategy and the timeline content. Advanced integrations can use:

- `resolveWebReducedMotionDiagnostics` to inspect the impact of reduced motion;
- `resolveWebActiveExecutionPlan` to see the active execution plan;
- `resolveWebPlayableTimeline` to choose the timeline variant to play;
- `simplifyWebTimeline` to build a simplified variant.

The driver does not automatically subscribe to preference changes. If your application needs live updates, observe `matchMedia` changes in application code and recreate or rewire the driver accordingly.

## Conflict handling

Browser animations can overlap on the same element. Tiqlyne models conflict behavior so applications can decide what should happen when a new animation starts while another one is still active.

The Web package includes helpers for checking active animations, cancelling tracked animations and resolving effective conflict strategies:

- `hasActiveWebAnimations`
- `isActiveWebAnimation`
- `cancelWebAnimations`
- `getEffectiveWebConflictStrategy`

Use these helpers when building custom playback flows, visual editors or debugging tools.

## What this package does not do

`@tiqlyne/motion-web` does not define motion presets by itself. It plays timelines and registered motions, but it does not include `fade-in`, `slide-in` or other motion definitions. Install `@tiqlyne/motion-pack-basic` for the official starter pack.

It also does not provide React, Vue, Angular or Svelte hooks. Framework adapters can be built on top of the same core and Web driver contracts.

## Documentation

- Documentation website: <https://moaazkhassawneh.github.io/tiqlyne/>
- Web engine setup: <https://moaazkhassawneh.github.io/tiqlyne/docs/tutorials/web-engine-setup>
- Web package docs: <https://moaazkhassawneh.github.io/tiqlyne/docs/packages/motion-web>
- Reduced motion guide: <https://moaazkhassawneh.github.io/tiqlyne/docs/guides/reduced-motion>
- Public exports: <https://moaazkhassawneh.github.io/tiqlyne/docs/reference/public-exports>

## Versioning

This package is versioned independently from the other Tiqlyne packages. Do not assume that all `@tiqlyne/*` packages share the same version.

Before `1.0.0`, minor versions may still contain breaking API changes. Check the changelog and release notes when upgrading.

## License

MIT.
