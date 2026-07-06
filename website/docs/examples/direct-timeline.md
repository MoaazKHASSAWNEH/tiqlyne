---
sidebar_position: 7
---

# Direct timeline

## Goal

Create a one-off opacity and vertical-motion entrance without registering a definition.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web
```

```html
<div id="message">Timeline playback</div>
```

```ts
import { createMotionEngine, createMotionTimeline } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const element = document.querySelector('#message');
if (!element) throw new Error('Message not found');

const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({ duration: 300, easing: 'ease-out', fill: 'both' });
  timeline.track('self', (track) => {
    track.step((step) => {
      step.from({ opacity: 0, transform: { y: 20 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});

const motion = createMotionEngine<Element>({ driver: new WebMotionDriver() });
const result = await motion.playTimeline(element, timeline);
```

## Expected result

The element moves upward and becomes opaque. Use a registered definition instead when this behavior must be reused or configured by type.

## Common mistakes

Creating empty keyframes or putting timeline-only defaults on `MotionConfig`.

Related: [Direct timelines guide](../guides/direct-timelines.md) and [timeline builder](../reference/timeline-builder.md).
