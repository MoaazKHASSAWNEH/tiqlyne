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
  driver: new WebMotionDriver(),
});
```

## Available motions

The current version includes three motions:

| Motion type | Description |
| --- | --- |
| `fade-in` | Makes the target appear progressively using opacity. |
| `fade-out` | Makes the target disappear progressively using opacity. |
| `slide-in` | Makes the target enter with a directional slide. |

## fade-in

`fade-in` animates opacity from a lower value to a higher value.

```ts
await motion.play(element, {
  type: 'fade-in',
  trigger: 'manual',
  options: {
    fromOpacity: 0,
    toOpacity: 1,
  },
});
```

Options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `fromOpacity` | number | `0` | Initial opacity. |
| `toOpacity` | number | `1` | Final opacity. |

## fade-out

`fade-out` animates opacity from a higher value to a lower value.

```ts
await motion.play(element, {
  type: 'fade-out',
  trigger: 'manual',
  options: {
    fromOpacity: 1,
    toOpacity: 0,
  },
});
```

Options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `fromOpacity` | number | `1` | Initial opacity. |
| `toOpacity` | number | `0` | Final opacity. |

## slide-in

`slide-in` animates the target from a direction into its final position.

```ts
await motion.play(element, {
  type: 'slide-in',
  trigger: 'manual',
  options: {
    direction: 'bottom',
    distance: 24,
    fade: true,
  },
});
```

Options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `direction` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'bottom'` | Direction from which the target enters. |
| `distance` | number | `24` | Slide distance in pixels. |
| `fade` | boolean | `true` | Whether opacity should be animated too. |

## Reduced motion

`slide-in` provides a reduced motion timeline that simplifies the movement and focuses on opacity.

This helps reduce potentially uncomfortable motion while preserving visual feedback.

## What this package does not include

The current version does not include:

- `slide-out`
- `zoom-in`
- `zoom-out`
- `scale`
- `rotate`
- `shake`
- `bounce`
- `pulse`
- `flip`

Only the motions documented on this page are part of `@tiqlyne/motion-pack-basic` in version `0.1.0`.

## When to use it

Use `@tiqlyne/motion-pack-basic` when you want official ready-to-use motions without writing custom motion definitions.