---
sidebar_position: 5
---

# Direct timeline example

A direct timeline is useful when an animation is specific to one use case and does not need a reusable motion definition.

## What this example demonstrates

This example demonstrates a custom entrance animation with opacity and vertical movement.

The timeline uses:

- timeline defaults;
- a `self` track;
- one animation step;
- opacity keyframes;
- transform keyframes.

## When to use it

Use direct timelines when you need precise one-off animation control.

For reusable animations, prefer a registered motion definition.

```ts
import { createMotionTimeline } from '@tiqlyne/motion-core';

const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({ duration: 300, easing: 'ease-out', fill: 'both' });
  timeline.track('self', (track) => {
    track.step((step) => {
      step.from({ opacity: 0, transform: { y: 20 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});

const result = await motion.playTimeline(element, timeline);
```
