---
sidebar_position: 7
---

# Timeline builder

`createMotionTimeline(callback)` is the preferred fluent API for producing a `MotionTimelineDefinition`. `createMotionTimelineBuilder()` returns the builder for manual or chained construction.

## Quick example

```ts
import { createMotionTimeline } from '@tiqlyne/motion-core';

const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({ duration: 300, easing: 'ease-out', fill: 'both' });
  timeline.label('details', 300);

  timeline.track('self', (track) => {
    track.defaults({ duration: 200 });
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
    track.step({ at: { anchor: 'previous-end', offset: 50 } }, (step) => {
      step.keyframes([{ transform: { scale: 0.96 } }, { transform: { scale: 1 } }]);
    });
  });

  timeline.track({ type: 'selector', selector: '.item' }, (track) => {
    track.stagger({ each: 40, from: 'start' });
    track.step({ at: 0 }, (step) => {
      step.from({ opacity: 0, transform: { y: 12 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });

  timeline.track({ type: 'child', name: 'title' }, (track) => {
    track.step({ at: 'details' }, (step) => step.to({ opacity: 1 }));
  });
});
```

---

## `MotionTimelineBuilder` methods

| Method     | Signature                                    | Purpose                                               |
| ---------- | -------------------------------------------- | ----------------------------------------------------- |
| `defaults` | `(defaults: MotionTimelineDefaults) => this` | Set timeline-level timing defaults                    |
| `label`    | `(name: string, position: number) => this`   | Add a named label at an absolute millisecond position |
| `track`    | `(target, callback) => this`                 | Add a track targeting one or more elements            |
| `build`    | `() => MotionTimelineDefinition`             | Build an immutable snapshot                           |

---

## `MotionTrackBuilder` methods

| Method     | Signature                                    | Purpose                                         |
| ---------- | -------------------------------------------- | ----------------------------------------------- |
| `defaults` | `(defaults: MotionTimelineDefaults) => this` | Set track-level timing defaults                 |
| `stagger`  | `(stagger: MotionStaggerDefinition) => this` | Configure stagger for multiple resolved targets |
| `step`     | `(callback) => this`                         | Add a step with no options                      |
| `step`     | `(options, callback) => this`                | Add a step with explicit options                |
| `build`    | `() => MotionTrackDefinition`                | Build an immutable snapshot                     |

---

## `MotionStepBuilder` methods

| Method      | Signature                                            | Purpose                                   |
| ----------- | ---------------------------------------------------- | ----------------------------------------- |
| `keyframe`  | `(keyframe: MotionKeyframe) => this`                 | Add one keyframe                          |
| `keyframes` | `(keyframes: ReadonlyArray<MotionKeyframe>) => this` | Add multiple keyframes                    |
| `from`      | `(keyframe: MotionKeyframe) => this`                 | Add a start keyframe (forces `offset: 0`) |
| `to`        | `(keyframe: MotionKeyframe) => this`                 | Add an end keyframe (forces `offset: 1`)  |
| `build`     | `() => MotionStepDefinition`                         | Build an immutable snapshot               |

---

## Track target shorthand

`track('self', ...)` is shorthand for `track({ type: 'self' }, ...)`.

Common target forms:

| Shorthand / object                        | Resolves to                                    |
| ----------------------------------------- | ---------------------------------------------- |
| `'self'`                                  | `{ type: 'self' }` — the root target element   |
| `{ type: 'child', name: 'title' }`        | Child element with `data-motion-child="title"` |
| `{ type: 'selector', selector: '.item' }` | All elements matching `.item` within root      |

---

## Step options (`MotionStepBuilderOptions`)

Step options are all fields from `MotionStepDefinition` except `keyframes`:

| Option         | Type                      | Notes                                                 |
| -------------- | ------------------------- | ----------------------------------------------------- |
| `at`           | `MotionStepPosition`      | Position override for this step                       |
| `duration`     | `number`                  | Milliseconds, finite ≥ 0                              |
| `delay`        | `number`                  | Milliseconds, finite ≥ 0                              |
| `easing`       | `MotionEasing`            | CSS easing or cubic-bezier                            |
| `fill`         | `MotionFillMode`          | `none`, `forwards`, `backwards`, `both`, `auto`       |
| `iterations`   | `MotionIterationCount`    | Positive finite number or `'infinite'`                |
| `direction`    | `MotionPlaybackDirection` | `normal`, `reverse`, `alternate`, `alternate-reverse` |
| `yoyo`         | `boolean`                 | Cannot be combined with `direction`                   |
| `endDelay`     | `number`                  | Milliseconds, finite ≥ 0                              |
| `playbackRate` | `number`                  | Finite and > 0                                        |
| `offset`       | `number`                  | Low-level, 0–1; distinct from keyframe offsets        |

---

## Default cascade

Timing values resolve from most specific to least specific:

```
step options → track defaults → timeline defaults
```

---

## Parallel tracks and sequential steps

Tracks share the same timeline and run in parallel. Steps within a track are sequential by default unless an explicit `at` position is set.

For the complete guide on `at`, labels, and anchors, see [Timeline positions and labels](../guides/timeline-positions-and-labels.md).
For timing details (fill, yoyo, direction, iterations, etc.), see [Timeline timing options](../guides/timeline-timing-options.md).

---

## yoyo / direction conflict

`yoyo: true` and `direction` cannot be used together on the same step. See [Timeline timing options](../guides/timeline-timing-options.md#yoyo-vs-direction) for details.

---

## Common mistakes

| Mistake                                                         | Fix                                                                             |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Creating an empty step                                          | Add at least one keyframe                                                       |
| Referencing a label before declaring it                         | Declare `timeline.label(name, ms)` before any step uses it                      |
| Placing `fill` on `MotionConfig`                                | `MotionConfig` has no `fill` field; use `timeline.defaults({ fill: 'both' })`   |
| Setting `step.keyframes([...])` and expecting automatic offsets | Offsets are not added automatically; use `from`/`to` or set `offset` explicitly |
| Using `yoyo: true` with `direction`                             | They conflict; use one or the other                                             |

---

## Related pages

- [Direct timelines guide](../guides/direct-timelines.md)
- [Timeline positions and labels](../guides/timeline-positions-and-labels.md)
- [Timeline timing options](../guides/timeline-timing-options.md)
- [Multiple tracks and steps](../guides/multiple-tracks-and-steps.md)
- [Timeline model](./motion-timeline.md)
