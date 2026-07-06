---
sidebar_position: 8
---

# Multiple tracks

## Goal

Fade a card while its title moves in parallel.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web
```

```html
<article id="card"><h2 data-motion-child="title">Parallel tracks</h2></article>
```

```ts
import { createMotionEngine, createMotionTimeline } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const card = document.querySelector('#card');
if (!card) throw new Error('Card not found');

const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({ duration: 300, easing: 'ease-out', fill: 'both' });
  timeline.track('self', (track) => {
    track.step({ at: 0 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
  timeline.track({ type: 'child', name: 'title' }, (track) => {
    track.step({ at: 0 }, (step) => {
      step.from({ transform: { y: 16 } });
      step.to({ transform: { y: 0 } });
    });
  });
});

const motion = createMotionEngine<Element>({ driver: new WebMotionDriver() });
await motion.playTimeline(card, timeline);
```

## Expected result

Both tracks start at zero and run together. If the child attribute is missing, playback fails with `target-not-found`.

## Common mistakes

Omitting explicit positions when tracks should align or forgetting the child data attribute.

Related: [Multiple tracks guide](../guides/multiple-tracks-and-steps.md) and [timeline builder](../reference/timeline-builder.md).
