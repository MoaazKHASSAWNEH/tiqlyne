---
sidebar_position: 5
---

# Multiple tracks and steps

Tracks run on a shared timeline. Steps in one track are sequential unless `at` positions them explicitly.

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

- [Timeline model](../reference/motion-timeline.md)
- [Timeline builder](../reference/timeline-builder.md)
- [Staggered list example](../examples/stagger-list.md)
