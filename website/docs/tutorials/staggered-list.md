---
sidebar_position: 6
---

# Animate a staggered list

## Goal

Resolve several descendants and offset their animation starts.

## Prerequisites

Use the configured Web engine from [Web engine setup](./web-engine-setup.md).

```html
<ul id="features">
  <li class="feature">Typed</li>
  <li class="feature">Inspectable</li>
  <li class="feature">Accessible</li>
</ul>
```

```ts
import { createMotionTimeline } from '@tiqlyne/motion-core';

const timeline = createMotionTimeline((timeline) => {
  timeline.track({ type: 'selector', selector: '.feature' }, (track) => {
    track.stagger({ each: 60, from: 'start' });
    track.step({ duration: 220, easing: 'ease-out', fill: 'both' }, (step) => {
      step.from({ opacity: 0, transform: { y: 12 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});

const list = document.querySelector('#features');
if (!list) throw new Error('Feature list not found');
await motion.playTimeline(list, timeline);
```

## What you learned

Selector targets resolve every match; `stagger` accepts milliseconds or `{ each, from }`.

## Next steps

Build a [composition](./composition.md). See the [stagger example](../examples/stagger-list.md).
