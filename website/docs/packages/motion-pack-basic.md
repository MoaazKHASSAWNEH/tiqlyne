---
sidebar_position: 3
---

# @tiqlyne/motion-pack-basic

`@tiqlyne/motion-pack-basic` is the official basic motion pack for Tiqlyne Motion Engine.

It provides ready-to-use motion definitions that can be registered in a motion registry.

## Install

```bash
pnpm add @tiqlyne/motion-pack-basic
```

For browser usage with the official Web driver:

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

## Register the pack

```ts
import { DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';

const registry = new DefaultMotionRegistry();

registerBasicMotions(registry);
```

Then pass the registry to the engine:

```ts
import { createMotionEngine } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver()
});
```

## Available motions

The current version includes three motions:

| Motion type | Description                                             |
| ----------- | ------------------------------------------------------- |
| `fade-in`   | Makes the target appear progressively using opacity.    |
| `fade-out`  | Makes the target disappear progressively using opacity. |
| `slide-in`  | Makes the target enter with a directional slide.        |

## fade-in

`fade-in` animates opacity from a lower value to a higher value.

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

Export: `FadeInMotion` (`FadeInMotionOptions`). Category: `entrance`. Label: “Fade in”.

| Option        | Default | Range / step    |
| ------------- | ------: | --------------- |
| `fromOpacity` |     `0` | `0..1` / `0.05` |
| `toOpacity`   |     `1` | `0..1` / `0.05` |

Validation requires `fromOpacity < toOpacity`. The generated `self` track transitions opacity between those values with the config duration, delay and easing, and `fill: 'both'`.

## fade-out

`fade-out` animates opacity from a higher value to a lower value.

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

Export: `FadeOutMotion` (`FadeOutMotionOptions`). Category: `exit`. Label: “Fade out”.

| Option        | Default | Range / step    |
| ------------- | ------: | --------------- |
| `fromOpacity` |     `1` | `0..1` / `0.05` |
| `toOpacity`   |     `0` | `0..1` / `0.05` |

Validation requires `fromOpacity > toOpacity`. The generated `self` track transitions opacity between those values with the config duration, delay and easing, and `fill: 'both'`.

## slide-in

`slide-in` animates the target from a direction into its final position.

```ts
await motion.play(element, {
  id: 'card-slide-in',
  type: 'slide-in',
  trigger: 'manual',
  options: {
    direction: 'bottom',
    distance: 24,
    fade: true
  }
});
```

Export: `SlideInMotion` (`SlideInMotionOptions`, `SlideInDirection`). Category: `entrance`. Label: “Slide in”.

| Option      | Type                                     | Default    | Description                             |
| ----------- | ---------------------------------------- | ---------- | --------------------------------------- |
| `direction` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'bottom'` | Direction from which the target enters. |
| `distance`  | number                                   | `24`       | Pixels; range `0..300`, step `1`.       |
| `fade`      | boolean                                  | `true`     | Whether opacity should be animated too. |

## Reduced motion

`slide-in` moves from the selected axis and distance to `translate3d(0, 0, 0)`, optionally fading from `0` to `1`. It uses the config timing and `fill: 'both'`.

`slide-in` provides a reduced timeline: opacity `0` to `1`, no movement, no delay, `ease-out`, and a duration capped at `150` ms. `fade-in` and `fade-out` do not define motion-specific reduced timelines in 0.1.0; the Web driver may use its generic fallback when strategy is `simplify`.

This helps reduce potentially uncomfortable motion while preserving visual feedback.

## What this package does not include

Only the three motions documented on this page are part of `@tiqlyne/motion-pack-basic` in version `0.1.0`. See [Limitations](../release/limitations.md) and [Roadmap](../release/roadmap.md) for work that is not currently available.

## When to use it

Use `@tiqlyne/motion-pack-basic` when you want official ready-to-use motions without writing custom motion definitions.
