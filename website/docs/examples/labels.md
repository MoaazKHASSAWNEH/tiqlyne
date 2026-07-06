---
sidebar_position: 9
---

# Timeline labels

## Goal

Create a labelled timeline and jump a Web controller to a meaningful point.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web
```

```html
<div id="preview">Labelled preview</div>
```

```ts
import { createMotionEngine, createMotionTimeline } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const element = document.querySelector('#preview');
if (!element) throw new Error('Preview not found');

const timeline = createMotionTimeline((timeline) => {
  timeline.label('details', 300);
  timeline.track('self', (track) => {
    track.step({ duration: 600, fill: 'both' }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

const motion = createMotionEngine<Element>({ driver: new WebMotionDriver() });
const playback = motion.createTimelinePlayback(element, timeline);
const result = await playback.jumpToLabel('details');
console.log(result.status, playback.getState().currentTime);
```

## Expected result

The controller seeks to 300 ms. Blank or unknown labels return skipped results.

## Common mistakes

Jumping after playback becomes terminal or referencing a label that was never added to the timeline.

## Related pages

- [Labels guide](../guides/labels.md)
- [Controller reference](../reference/playback-controller.md)
