---
sidebar_position: 8
---

# Child targets example

## Goal

Use a `child` target when a reusable timeline should animate a semantic part of its root.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web
```

```html
<article id="card" aria-labelledby="card-title">
  <h2 id="card-title" data-motion-child="title">Documentation</h2>
  <p>Typed motion for the Web.</p>
</article>
```

```ts
import { createMotionEngine, createMotionTimeline } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const root = document.querySelector('#card');
if (!root) throw new Error('Card not found');

const motion = createMotionEngine<Element>({ driver: new WebMotionDriver() });
const timeline = createMotionTimeline((timeline) => {
  timeline.track({ type: 'child', name: 'title' }, (track) => {
    track.step({ duration: 250, easing: 'ease-out', fill: 'both' }, (step) => {
      step.from({ opacity: 0, transform: { y: 8 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});

const result = await motion.playTimeline(root, timeline);
```

## Expected result

The heading is the only animated element. If the attribute is missing or not below `root`, the result fails with `target-not-found`.

## Common mistakes

Placing the attribute outside the playback root or expecting `child` to animate several matches.

Related: [Motion targets](../reference/motion-targets.md).
