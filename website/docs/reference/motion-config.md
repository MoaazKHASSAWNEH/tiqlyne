---
sidebar_position: 2
---

# Motion config

`MotionConfig` selects a registered definition and supplies per-playback values. Both `id` and `type` are required.

```ts
import type { MotionConfig } from '@tiqlyne/motion-core';

const config: MotionConfig = {
  id: 'hero-enter',
  type: 'slide-in',
  trigger: 'manual',
  duration: 300,
  easing: 'ease-out',
  options: { direction: 'bottom', distance: 24, fade: true }
};

const result = await motion.play(element, config);
```

## Fields

| Field                   | Type                                  | Required | Default after normalization    |
| ----------------------- | ------------------------------------- | -------- | ------------------------------ |
| `id`                    | `string`                              | yes      | —                              |
| `type`                  | `string`                              | yes      | —                              |
| `trigger`               | `MotionTriggerType`                   | no       | `'onEnter'`                    |
| `enabled`               | `boolean`                             | no       | `true`                         |
| `duration`              | `number`                              | no       | `300` ms, clamped to `0..5000` |
| `delay`                 | `number`                              | no       | `0` ms, clamped to `0..5000`   |
| `easing`                | `MotionEasing`                        | no       | `'ease'`                       |
| `options`               | `Record<string, unknown>`             | no       | `{}`                           |
| `respectReducedMotion`  | `boolean`                             | no       | `true`                         |
| `reducedMotionStrategy` | `'skip' \| 'simplify' \| 'preserve'`  | no       | `'skip'`                       |
| `conflictStrategy`      | `'replace' \| 'parallel' \| 'ignore'` | no       | `'replace'`                    |
| `priority`              | `number`                              | no       | `0`, normalized to an integer  |
| `metadata`              | `Record<string, unknown>`             | no       | `{}`                           |

`fill`, `iterations`, and `playbackRate` are timeline/track/step defaults, not `MotionConfig` fields.

If `enabled` normalizes to `false`, `play` returns `{ status: 'skipped', reason: 'motion-disabled' }`. Unknown types return the reason `unknown-motion-type`.

## Normalization details

`DefaultMotionConfigNormalizer` converts blank `id`/`type` strings to internal fallbacks, unknown triggers to `onEnter`, blank easing strings to `ease`, invalid reduced strategies to `skip`, invalid conflict strategies to `replace`, non-record options/metadata to `{}`, and priority to an integer. Duration and delay use finite numeric normalization and clamp to `0..5000`.

Trigger values are `onEnter`, `onLeave`, `onClick`, `onHover`, `onFocus`, `onBlur`, `onStateChange`, and `manual`. The engine does not install trigger listeners; the value is execution metadata supplied to definitions/drivers.

`NormalizedMotionConfig` has the same field names, but every field is required after defaults are resolved. Applications normally pass `MotionConfig` and let the engine normalize it.

Common mistakes are omitting the compile-time-required `id`, placing timeline defaults in this object, and expecting unknown option keys to be interpreted by the engine rather than the selected definition.

## Related pages

- [Registered motions](../guides/registered-motions.md)
- [Motion options](./motion-options.md)
- [Reduced motion](./reduced-motion.md)
- [Conflict strategy](./conflict-strategy.md)
