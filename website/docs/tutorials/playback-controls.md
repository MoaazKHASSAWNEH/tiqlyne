---
sidebar_position: 8
---

# Add playback controls

## Goal

Pause, seek, resume, finish, and cancel a Web timeline.

## Prerequisites

Install core and Web packages.

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

const unsubscribe = playback.on('statusChange', ({ status }) => {
  console.log(status);
});

await playback.pause();
await playback.seek(150);
await playback.seekProgress(0.5);
await playback.jumpToLabel('details');
await playback.setPlaybackRate(1.25);
await playback.resume();

const finishResult = await playback.finish();
console.log(finishResult);

// Use cancel instead when playback should be abandoned:
// await playback.cancel();

unsubscribe();
playback.dispose();
```

Check each operation result. Unsupported controls and invalid transitions normally return `skipped` rather than throwing.

## What you learned

Disposal removes listeners; it does not cancel the animation.

## Next steps

Handle [reduced motion](./reduced-motion.md). See the [complete controller UI](../guides/playback-controllers.md).
