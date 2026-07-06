---
sidebar_position: 2
---

# Motion config

A motion config describes a registered motion to play.

```ts
await motion.play(element, {
  type: 'slide-in',
  trigger: 'manual',
  duration: 300,
  easing: 'ease-out',
  options: {
    direction: 'bottom',
    distance: 24,
    fade: true
  }
});
```

## Common fields

| Field                   | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `type`                  | Registered motion type.                             |
| `trigger`               | Trigger source.                                     |
| `options`               | Motion-specific options.                            |
| `duration`              | Duration in milliseconds.                           |
| `delay`                 | Delay in milliseconds.                              |
| `easing`                | Easing function.                                    |
| `fill`                  | Fill mode.                                          |
| `iterations`            | Iteration count.                                    |
| `playbackRate`          | Playback speed.                                     |
| `respectReducedMotion`  | Whether reduced motion should be considered.        |
| `reducedMotionStrategy` | Strategy used when reduced motion applies.          |
| `conflictStrategy`      | Strategy used when active animations already exist. |

## Option typing

Motion-specific options are defined by each motion definition.

For example, `slide-in` accepts `direction`, `distance` and `fade`.
