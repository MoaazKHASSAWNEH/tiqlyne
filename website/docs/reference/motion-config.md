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
