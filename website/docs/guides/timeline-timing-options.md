---
sidebar_position: 7
---

# Timeline timing options

## What you need to know

- Use `duration`, `delay`, `easing`, and `fill` for common timing.
- Use `iterations` to repeat a step.
- Use `yoyo: true` for simple alternate (back-and-forth) playback.
- **Do not combine `yoyo` and `direction`.** They conflict and validation will fail with `timeline-yoyo-direction-conflict`.
- Use `direction` when you need precise playback direction.
- Use `endDelay` to hold a pause after a step finishes.
- Use `playbackRate` to scale speed.
- Defaults cascade: step → track → timeline. The most specific value wins.

---

## The timing fields

| Field          | Type                      | Where applicable                        | Effective value when omitted                          |
| -------------- | ------------------------- | --------------------------------------- | ----------------------------------------------------- |
| `duration`     | `number` (ms, ≥ 0)        | step, track defaults, timeline defaults | **required** — must be set via step or defaults chain |
| `delay`        | `number` (ms, ≥ 0)        | step, track defaults, timeline defaults | `0` (Web driver applies `0`)                          |
| `easing`       | `MotionEasing`            | step, track defaults, timeline defaults | `'ease'` (Web driver applies `'ease'` when undefined) |
| `fill`         | `MotionFillMode`          | step, track defaults, timeline defaults | `'both'` (Web driver applies `'both'` when undefined) |
| `iterations`   | `number \| 'infinite'`    | step, track defaults, timeline defaults | `1` (WAAPI default)                                   |
| `direction`    | `MotionPlaybackDirection` | step, track defaults, timeline defaults | `'normal'` (WAAPI default)                            |
| `yoyo`         | `boolean`                 | step, track defaults, timeline defaults | no alternate (yoyo off by default)                    |
| `endDelay`     | `number` (ms, ≥ 0)        | step, track defaults, timeline defaults | `0` (WAAPI default)                                   |
| `playbackRate` | `number` (> 0)            | step, track defaults, timeline defaults | driver-specific; see the Web limitation below         |

:::note Core vs Web defaults
All timing fields are **optional** in the core model. The core applies defaults only from the cascade (step → track → timeline). If a value is still undefined after the cascade, the **Web driver** applies its own defaults: `easing` becomes `'ease'`, `fill` becomes `'both'`, and `delay` becomes `0`. Other fields fall back to Web Animations API defaults.

For `duration`: the core requires it to be set somewhere in the defaults chain. If it remains undefined, validation fails with `timeline-invalid-duration`.
:::

---

## Defaults cascade

Timing values resolve from the most specific scope to the least specific:

```
step value → track defaults → timeline defaults
```

```ts
import { createMotionTimeline } from '@tiqlyne/motion-core';

const timeline = createMotionTimeline((timeline) => {
  // Timeline-level defaults apply to every step
  timeline.defaults({ duration: 300, easing: 'ease-out', fill: 'both' });

  timeline.track('self', (track) => {
    // Track-level defaults override timeline defaults for this track
    track.defaults({ duration: 200 });

    // Step-level options override everything for this step
    track.step({ duration: 150, easing: 'ease-in' }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});
```

In this example, the step uses `duration: 150` (step wins), `easing: 'ease-in'` (step wins), `fill: 'both'` (falls through to timeline). Without those defaults, the Web driver would apply `easing: 'ease'` and `fill: 'both'`.

---

## `fill` — keep the end state

`fill` controls whether the animated properties retain their values before or after the step.

| Value         | Behavior                                                       |
| ------------- | -------------------------------------------------------------- |
| `'none'`      | No fill. Properties snap back when the step ends.              |
| `'forwards'`  | Keep the final value after the step finishes.                  |
| `'backwards'` | Apply the initial value before the step starts (during delay). |
| `'both'`      | Apply both `forwards` and `backwards`. Most common for UI.     |
| `'auto'`      | Let the driver decide (Web Animations API `fill: 'auto'`).     |

```ts
// Keep the element visible after the step ends
track.step({ duration: 300, fill: 'both' }, (step) => {
  step.from({ opacity: 0 });
  step.to({ opacity: 1 });
});
```

:::tip
Use `fill: 'both'` for most entrance/exit animations so the element stays at its final state.
:::

---

## `iterations` — repeat a step

`iterations` must be a positive finite number or `'infinite'`.

```ts
// Repeat 3 times
track.step({ duration: 400, iterations: 3 }, (step) => {
  step.from({ transform: { scale: 1 } });
  step.to({ transform: { scale: 1.05 } });
});

// Run forever
track.step({ duration: 800, iterations: 'infinite' }, (step) => {
  step.from({ opacity: 0.6 });
  step.to({ opacity: 1 });
});
```

:::warning Invalid iterations

- `iterations: 0` — fails validation (`timeline-invalid-iterations`)
- `iterations: -1` — fails validation
- `iterations: Infinity` — use the string `'infinite'` instead
  :::

---

## `direction` — control playback direction

`direction` controls the playback direction for a step.

| Value                 | Behavior                                                 |
| --------------------- | -------------------------------------------------------- |
| `'normal'`            | Plays from start to end. Default.                        |
| `'reverse'`           | Plays from end to start.                                 |
| `'alternate'`         | Alternates: first iteration normal, second reverse, etc. |
| `'alternate-reverse'` | Alternates starting in reverse.                          |

```ts
track.step({ duration: 400, direction: 'reverse' }, (step) => {
  step.from({ opacity: 1 });
  step.to({ opacity: 0 });
});
```

:::danger Do not mix with `yoyo`
`direction` and `yoyo` cannot be used together. See [yoyo vs direction](#yoyo-vs-direction) below.
:::

---

## `yoyo` — simple alternate playback

`yoyo: true` is a shortcut for alternate direction behavior. It makes a step play forward then backward on each iteration pair.

```ts
track.step({ duration: 600, iterations: 4, yoyo: true }, (step) => {
  step.from({ transform: { scale: 1 } });
  step.to({ transform: { scale: 1.1 } });
});
```

### yoyo vs direction

| Goal                                       | Use                                               |
| ------------------------------------------ | ------------------------------------------------- |
| Simple forward+backward repeat             | `yoyo: true`                                      |
| Precise playback direction                 | `direction`                                       |
| Alternate with specific starting direction | `direction: 'alternate'` or `'alternate-reverse'` |

**`yoyo: true` and `direction` cannot be used together.** The validator raises `timeline-yoyo-direction-conflict` if both are present on the same step or in a defaults block that applies to the same step.

```ts
// ❌ Invalid — do not combine yoyo and direction
track.step({ duration: 400, yoyo: true, direction: 'alternate' }, (step) => {
  step.from({ opacity: 0 });
  step.to({ opacity: 1 });
});

// ✅ Use direction if you need 'alternate'
track.step({ duration: 400, direction: 'alternate' }, (step) => {
  step.from({ opacity: 0 });
  step.to({ opacity: 1 });
});

// ✅ Use yoyo for simple back-and-forth
track.step({ duration: 400, yoyo: true }, (step) => {
  step.from({ opacity: 0 });
  step.to({ opacity: 1 });
});
```

---

## `endDelay` — pause after a step

`endDelay` adds a delay in milliseconds after a step's active phase ends but before the next step starts.

```ts
// Pause 200 ms after first step, then run the second
track.step({ duration: 300, endDelay: 200 }, (step) => {
  step.from({ opacity: 0 });
  step.to({ opacity: 1 });
});

track.step({ duration: 300 }, (step) => {
  step.from({ transform: { y: 16 } });
  step.to({ transform: { y: 0 } });
});
```

`endDelay` must be a finite non-negative number. Negative values fail validation with `timeline-invalid-end-delay`.

---

## `playbackRate` — request a step speed

`playbackRate` expresses a requested step speed. `1` is normal speed, `2` is double speed, and `0.5` is half speed for drivers that apply this field.

```ts
track.step({ duration: 600, playbackRate: 2 }, (step) => {
  step.from({ opacity: 0 });
  step.to({ opacity: 1 });
});
```

`playbackRate` must be a finite positive number.

:::warning Web driver limitation in 0.1.0
The current Web driver forwards step `playbackRate` with the keyframe-animation options but does not assign it to the created `Animation`. Browsers ignore that unknown timing member, so do not rely on step `playbackRate` changing Web playback speed in 0.1.0. For controllable browser playback, create a playback controller and `await playback.setPlaybackRate(rate)`.
:::

:::warning Invalid playback rates

- `playbackRate: 0` — fails validation (`timeline-invalid-playback-rate`)
- `playbackRate: -1` — fails validation
  :::

---

## Validation rules summary

| Field          | Valid values                                          | Error code                         |
| -------------- | ----------------------------------------------------- | ---------------------------------- |
| `duration`     | Finite number ≥ 0                                     | `timeline-invalid-duration`        |
| `delay`        | Finite number ≥ 0                                     | `timeline-invalid-delay`           |
| `fill`         | `none`, `forwards`, `backwards`, `both`, `auto`       | `timeline-invalid-fill`            |
| `iterations`   | Positive finite number or `'infinite'`                | `timeline-invalid-iterations`      |
| `direction`    | `normal`, `reverse`, `alternate`, `alternate-reverse` | `timeline-invalid-direction`       |
| `yoyo`         | `boolean` — cannot be combined with `direction`       | `timeline-yoyo-direction-conflict` |
| `endDelay`     | Finite number ≥ 0                                     | `timeline-invalid-end-delay`       |
| `playbackRate` | Finite positive number (> 0)                          | `timeline-invalid-playback-rate`   |

---

## Common mistakes

| Mistake                                                             | Fix                                                                                     |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `yoyo: true` with any `direction` value                             | Remove `direction` or replace `yoyo` with `direction: 'alternate'`                      |
| `iterations: 0`                                                     | Use `iterations: 1` or omit it                                                          |
| `playbackRate: 0`                                                   | Must be strictly greater than zero                                                      |
| `endDelay: -1`                                                      | Must be non-negative                                                                    |
| Setting `fill` on `MotionConfig`                                    | `MotionConfig` does not have a `fill` field — use `timeline.defaults({ fill: 'both' })` |
| Expecting `yoyo` to work without `iterations > 1`                   | `yoyo` on a single iteration has no visible effect                                      |
| Expecting `direction: 'alternate'` to work without `iterations > 1` | Alternation only takes effect on the second and later iterations                        |

---

## Direction ambiguity warning

There are two distinct uses of the word "direction" in this engine:

1. **Timeline playback direction** (`MotionPlaybackDirection`): controls how a step plays back.
   - Valid values: `normal`, `reverse`, `alternate`, `alternate-reverse`
   - Used as: `track.step({ duration: 300, direction: 'reverse' }, callback)`

2. **Slide-in motion direction** (`SlideInDirection`): controls which side a slide-in enters from.
   - Valid values: `left`, `right`, `top`, `bottom`
   - Used as: `motion.play(el, { id: 'panel-enter', type: 'slide-in', options: { direction: 'left' } })`

These are completely separate options. Do not confuse them.

---

## Related pages

- [Timeline positions and labels](./timeline-positions-and-labels.md)
- [Multiple tracks and steps](./multiple-tracks-and-steps.md)
- [Timeline model reference](../reference/motion-timeline.md)
- [Timeline builder reference](../reference/timeline-builder.md)
- [Troubleshooting](./troubleshooting.md)
