# @tiqlyne/motion-pack-basic

Official starter motion pack for Tiqlyne Motion Engine.

`@tiqlyne/motion-pack-basic` provides the first ready-to-use motion definitions for common UI transitions. It is designed to be registered in `@tiqlyne/motion-core` and played by any compatible driver, such as `@tiqlyne/motion-web` for browser applications.

Use this package when you want a small, predictable, documented set of official motions instead of writing custom motion definitions immediately.

## Installation

Install the pack with the core package:

```bash
npm install @tiqlyne/motion-core @tiqlyne/motion-pack-basic
```

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-pack-basic
```

For browser playback, install the Web driver too:

```bash
npm install @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

## Included motions

| Motion type | Class | Category | Purpose |
| --- | --- | --- | --- |
| `fade-in` | `FadeInMotion` | `entrance` | Makes a target appear progressively using opacity. |
| `fade-out` | `FadeOutMotion` | `exit` | Makes a target disappear progressively using opacity. |
| `slide-in` | `SlideInMotion` | `entrance` | Makes a target enter from one side with optional fading. |

The pack intentionally stays small. It is a stable foundation for examples, tests, documentation and early integrations, not a complete preset catalogue.

## Register the pack

Register the official motions once in a `DefaultMotionRegistry`:

```ts
import { DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';

const registry = new DefaultMotionRegistry();

registerBasicMotions(registry);
```

Then pass the registry to your motion engine:

```ts
import { createMotionEngine } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver(),
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});
```

## Play a registered motion

Once the pack is registered, use its motion type names in `motion.play` or inside a composition.

```ts
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

## Compose multiple motions

```ts
import { compileMotionComposition, createMotionComposition } from '@tiqlyne/motion-core';

const composition = createMotionComposition((compositionBuilder) => {
  compositionBuilder.defaults({ duration: 250, easing: 'ease-out', fill: 'both' });

  compositionBuilder.motion('fade-in', {
    options: { fromOpacity: 0, toOpacity: 1 }
  });

  compositionBuilder.motion('slide-in', {
    at: 120,
    options: { direction: 'bottom', distance: 32, fade: false }
  });
});

const timeline = compileMotionComposition(composition, { registry });

await motion.playTimeline(document.body, timeline);
```

## Motion options

### `fade-in`

`fade-in` animates opacity from a lower value to a higher value.

| Option | Default | Description |
| --- | ---: | --- |
| `fromOpacity` | `0` | Starting opacity. |
| `toOpacity` | `1` | Final opacity. |

Validation requires `fromOpacity < toOpacity`.

```ts
await motion.play(element, {
  id: 'card-fade-in',
  type: 'fade-in',
  trigger: 'manual',
  options: {
    fromOpacity: 0,
    toOpacity: 1
  }
});
```

### `fade-out`

`fade-out` animates opacity from a higher value to a lower value.

| Option | Default | Description |
| --- | ---: | --- |
| `fromOpacity` | `1` | Starting opacity. |
| `toOpacity` | `0` | Final opacity. |

Validation requires `fromOpacity > toOpacity`.

```ts
await motion.play(element, {
  id: 'card-fade-out',
  type: 'fade-out',
  trigger: 'manual',
  options: {
    fromOpacity: 1,
    toOpacity: 0
  }
});
```

### `slide-in`

`slide-in` animates a target from one side into its final position. It can optionally include opacity animation.

| Option | Default | Description |
| --- | --- | --- |
| `direction` | `'bottom'` | Direction from which the target enters: `'left'`, `'right'`, `'top'`, or `'bottom'`. |
| `distance` | `24` | Distance in pixels. |
| `fade` | `true` | Whether opacity should animate from `0` to `1`. |

```ts
await motion.play(element, {
  id: 'card-slide-in',
  type: 'slide-in',
  trigger: 'manual',
  options: {
    direction: 'left',
    distance: 32,
    fade: true
  }
});
```

## Reduced motion behavior

`slide-in` provides a motion-specific reduced timeline: it removes directional movement and keeps a short opacity transition. This helps preserve visual feedback while reducing potentially uncomfortable motion.

`fade-in` and `fade-out` do not define separate motion-specific reduced timelines. A compatible driver, such as `@tiqlyne/motion-web`, may still apply its generic reduced-motion fallback depending on the active reduced-motion strategy.

## Direct class usage

Most applications should use `registerBasicMotions`. Advanced integrations can import the classes directly:

```ts
import { FadeInMotion, FadeOutMotion, SlideInMotion } from '@tiqlyne/motion-pack-basic';
```

Direct class usage is useful for custom registries, tests, documentation generation or tooling that needs to inspect definitions manually.

## What this package does not include

This package does not include `slide-out`, zoom, scale, shake, bounce, pulse, scroll-triggered animations, gesture-driven animations or framework adapters. Those are future extension points or separate packages.

It also does not play animations by itself. Use a compatible driver such as `@tiqlyne/motion-web` to execute timelines in a browser.

## Documentation

- Documentation website: <https://moaazkhassawneh.github.io/tiqlyne/>
- Basic motions guide: <https://moaazkhassawneh.github.io/tiqlyne/docs/guides/basic-motions>
- Basic pack reference: <https://moaazkhassawneh.github.io/tiqlyne/docs/reference/basic-pack>
- Package page: <https://moaazkhassawneh.github.io/tiqlyne/docs/packages/motion-pack-basic>
- Public exports: <https://moaazkhassawneh.github.io/tiqlyne/docs/reference/public-exports>

## Versioning

This package is versioned independently from the other Tiqlyne packages. Do not assume that all `@tiqlyne/*` packages share the same version.

Before `1.0.0`, minor versions may still contain breaking API changes. Check the changelog and release notes when upgrading.

## License

MIT.
