---
sidebar_position: 6
---

# Timeline positions and labels

## What you need to know

- **Tracks run in parallel.** Each track has its own independent timeline.
- **Steps in one track are sequential by default.** Each step starts after the previous one ends.
- **`at` positions a step explicitly.** It overrides the default sequential behavior.
- **Labels are named absolute times.** They let you reference positions by name instead of raw milliseconds.
- **Anchors position a step relative to the current track.** Useful when you do not know the exact time in advance.
- **`jumpToLabel` lets a playback controller seek to a label.** The label must exist on the compiled timeline.

---

## Default sequencing

Without `at`, steps in a track run one after another:

```ts
import { createMotionTimeline } from '@tiqlyne/motion-core';

const timeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    // Step 1: starts at 0 ms, runs for 300 ms
    track.step({ duration: 300 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });

    // Step 2: starts at 300 ms (after step 1), runs for 200 ms
    track.step({ duration: 200 }, (step) => {
      step.from({ transform: { y: 12 } });
      step.to({ transform: { y: 0 } });
    });
  });
});
```

---

## Parallel tracks

Multiple tracks run at the same time. They do not wait for each other:

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step({ duration: 300 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });

  // This track runs in parallel with the first track
  timeline.track({ type: 'child', name: 'title' }, (track) => {
    track.step({ duration: 400 }, (step) => {
      step.from({ transform: { y: -8 } });
      step.to({ transform: { y: 0 } });
    });
  });
});
```

---

## `at` — position a step explicitly

`at` overrides the sequential default and places the step at a specific position.

### Forms accepted by `at`

| Form                  | Example                                       | Meaning                               |
| --------------------- | --------------------------------------------- | ------------------------------------- |
| `number`              | `at: 0`                                       | Absolute time in milliseconds         |
| `string`              | `at: 'details'`                               | Shorthand for `{ label: 'details' }`  |
| `{ label, offset? }`  | `at: { label: 'details', offset: 50 }`        | Label time plus optional offset in ms |
| `{ anchor, offset? }` | `at: { anchor: 'previous-end', offset: 100 }` | Anchor plus optional offset in ms     |

```ts
timeline.track('self', (track) => {
  // Explicit millisecond position
  track.step({ at: 0, duration: 300 }, (step) => {
    step.from({ opacity: 0 });
    step.to({ opacity: 1 });
  });

  // After the previous step's end, plus 50 ms
  track.step({ at: { anchor: 'previous-end', offset: 50 }, duration: 200 }, (step) => {
    step.from({ transform: { scale: 0.96 } });
    step.to({ transform: { scale: 1 } });
  });
});
```

---

## Anchors

Anchors resolve a position relative to the current track's already-scheduled state.

| Anchor           | Resolves to                                     |
| ---------------- | ----------------------------------------------- |
| `track-start`    | The beginning of the track (always 0)           |
| `track-end`      | The end of the last scheduled step in the track |
| `previous-start` | The start time of the previous step             |
| `previous-end`   | The end time of the previous step               |

```ts
timeline.track('self', (track) => {
  track.step({ duration: 300 }, (step) => {
    step.from({ opacity: 0 });
    step.to({ opacity: 1 });
  });

  // Starts at track-end (after the last step), 100 ms later
  track.step({ at: { anchor: 'track-end', offset: 100 }, duration: 200 }, (step) => {
    step.from({ transform: { y: 8 } });
    step.to({ transform: { y: 0 } });
  });

  // Starts at the same time as the previous step (overlap)
  track.step({ at: { anchor: 'previous-start' }, duration: 400 }, (step) => {
    step.from({ transform: { scale: 0.95 } });
    step.to({ transform: { scale: 1 } });
  });
});
```

---

## Labels — named positions

Labels map names to absolute times in milliseconds. You declare them on the timeline and reference them in `at`.

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.label('intro', 0);
  timeline.label('details', 400);

  timeline.track('self', (track) => {
    // Positioned at 'intro' (0 ms)
    track.step({ at: 'intro', duration: 300 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });

    // Positioned at 'details' (400 ms)
    track.step({ at: 'details', duration: 200 }, (step) => {
      step.from({ transform: { y: 12 } });
      step.to({ transform: { y: 0 } });
    });
  });

  // Using label reference with offset
  timeline.track({ type: 'child', name: 'subtitle' }, (track) => {
    track.step({ at: { label: 'details', offset: 50 }, duration: 300 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});
```

### Label rules

- Label names must be non-empty strings.
- Label times must be finite and non-negative numbers (in milliseconds).
- A step that references a label must use a name that exists on the timeline.
- Unknown label references fail validation with `timeline-missing-label-reference`.

---

## `jumpToLabel` — seeking with controllers

Labels let a `MotionPlaybackController` seek to a meaningful point in the animation:

```ts
import { createMotionEngine, createMotionTimeline } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const timeline = createMotionTimeline((timeline) => {
  timeline.label('details', 400);

  timeline.track('self', (track) => {
    track.step({ duration: 600, fill: 'both' }, (step) => {
      step.from({ opacity: 0, transform: { y: 20 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});

const motion = createMotionEngine<Element>({ driver: new WebMotionDriver() });
const playback = motion.createTimelinePlayback(element, timeline);

// Seek to the 'details' label
const result = await playback.jumpToLabel('details');
console.log(result.status); // 'finished' or 'skipped'
```

`jumpToLabel` returns a skipped result with reason `web-playback-jump-to-label-unknown-label` when the label is not found, or when the controller is already in a terminal state.

---

## Timeline labels vs composition item labels

These are two different things:

| Concept                    | Declared with                                   | Purpose                                                                                           |
| -------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Timeline label**         | `timeline.label(name, ms)`                      | Named position in milliseconds on a compiled timeline. Used for seeking, `at`, and `jumpToLabel`. |
| **Composition item label** | `composition.motion('type', { label: 'name' })` | Exposes the start position of a composition item as a timeline label after compilation.           |

When you give a composition item a `label`, the compiler resolves its position and adds it to the compiled timeline's labels. This means you can then use `jumpToLabel('name')` on the compiled timeline.

```ts
const composition = createMotionComposition((composition) => {
  composition.motion('fade-in', {
    label: 'entrance' // becomes a timeline label after compilation
  });

  composition.motion('slide-in', {
    at: 200,
    label: 'slide' // positioned at 200 ms in the compiled timeline
  });
});
```

### Limitation in 0.1.0

A labelled composition item **cannot use an anchor-based `at` position**. The compiler resolves label times to absolute milliseconds before it processes anchor positions, so the anchor would refer to no known time.

```ts
// ❌ Invalid — labelled item with anchor-based at
composition.motion('fade-in', {
  label: 'entrance',
  at: { anchor: 'previous-end' } // not supported in 0.1.0
});

// ✅ Valid — labelled item with absolute at
composition.motion('fade-in', {
  label: 'entrance',
  at: 0
});

// ✅ Valid — anchor-based at on an unlabelled item
composition.motion('slide-in', {
  at: { anchor: 'previous-end', offset: 50 } // no label, so anchor is fine
});
```

Nested timeline labels from a composed timeline item are **not automatically preserved** in the compiled output unless they are explicitly declared on the composition.

---

## Complete example

```ts
import { createMotionTimeline } from '@tiqlyne/motion-core';

const timeline = createMotionTimeline((timeline) => {
  // Timeline-level labels
  timeline.label('intro', 0);
  timeline.label('details', 500);

  // Defaults for all tracks
  timeline.defaults({ easing: 'ease-out', fill: 'both' });

  // Track 1 — main element
  timeline.track('self', (track) => {
    track.step({ at: 'intro', duration: 400 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });

    track.step({ at: { anchor: 'previous-end', offset: 100 }, duration: 300 }, (step) => {
      step.from({ transform: { scale: 0.96 } });
      step.to({ transform: { scale: 1 } });
    });
  });

  // Track 2 — runs in parallel with track 1
  timeline.track({ type: 'selector', selector: '.item' }, (track) => {
    track.stagger({ each: 50, from: 'start' });
    track.step({ at: 'details', duration: 300 }, (step) => {
      step.from({ opacity: 0, transform: { y: 12 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});
```

---

## Common mistakes

| Mistake                                                   | Fix                                                                                           |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Referencing a label that was not declared                 | Declare the label with `timeline.label(name, ms)` before referencing it                       |
| Using `jumpToLabel` after a terminal state                | Check `playback.status` first; reset the playback if needed                                   |
| Expecting label times to be in seconds                    | Label times are always in **milliseconds**                                                    |
| Using an anchor-based `at` on a labelled composition item | Not supported in 0.1.0; use an absolute time instead                                          |
| Expecting tracks to be sequential                         | Tracks always run in parallel                                                                 |
| Setting `at: 0` without realizing it overrides sequencing | This is intentional; steps without `at` are sequential                                        |
| Confusing composition labels with timeline labels         | See [timeline labels vs composition item labels](#timeline-labels-vs-composition-item-labels) |

---

## Related pages

- [Multiple tracks and steps](./multiple-tracks-and-steps.md)
- [Timeline timing options](./timeline-timing-options.md)
- [Timeline builder reference](../reference/timeline-builder.md)
- [Timeline model reference](../reference/motion-timeline.md)
- [Playback controllers](./playback-controllers.md)
- [Compositions](./compositions.md)
- [Labels example](../examples/labels.md)
