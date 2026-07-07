---
sidebar_position: 5
---

# Multiple tracks and steps

## What you need to know

- Tracks run in parallel on a shared timeline.
- Steps inside one track are sequential by default.
- `at` overrides sequencing and places a step at an explicit position.
- Labels and anchors are forms of `at` that reference positions by name or relative anchor.
- Selector tracks may resolve to multiple targets; `stagger` adds delay between them.

For the complete guide on `at`, labels, and anchors, see [Timeline positions and labels](./timeline-positions-and-labels.md). For timing options (duration, fill, yoyo, direction, etc.), see [Timeline timing options](./timeline-timing-options.md).

---

```ts
import { createMotionTimeline } from '@tiqlyne/motion-core';

const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({ duration: 200, easing: 'ease-out', fill: 'both' });

  timeline.track('self', (track) => {
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
    track.step({ at: 'intro-done' }, (step) => {
      step.from({ transform: { scale: 0.96 } });
      step.to({ transform: { scale: 1 } });
    });
  });

  timeline.track({ type: 'selector', selector: '.item' }, (track) => {
    track.stagger({ each: 50, from: 'start' });
    track.step({ at: 0 }, (step) => {
      step.from({ opacity: 0, transform: { y: 12 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });

  timeline.label('intro-done', 200);
});

await motion.playTimeline(root, timeline);
```

`at` accepts milliseconds, a label string, `{ label, offset? }`, or `{ anchor, offset? }`. Anchors are `track-start`, `track-end`, `previous-start`, and `previous-end`. Stagger origins are `start`, `end`, and `center`.

## Related pages

- [Timeline positions and labels](./timeline-positions-and-labels.md) — complete guide on `at`, labels, and anchors
- [Timeline timing options](./timeline-timing-options.md) — duration, fill, iterations, yoyo, direction
- [Timeline model](../reference/motion-timeline.md)
- [Timeline builder](../reference/timeline-builder.md)
- [Staggered list example](../examples/stagger-list.md)
