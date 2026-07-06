---
sidebar_position: 11
---

# Playback controller

## Goal

Create a finite labelled timeline and control it through the Web controller.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web
```

```html
<div id="preview">Controlled preview</div>
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
const unsubscribe = playback.on('pause', ({ status }) => console.log(status));

await playback.pause();
await playback.seekProgress(0.5);
await playback.jumpToLabel('details');
await playback.setPlaybackRate(1.5);
await playback.resume();
const finalResult = await playback.finished;

unsubscribe();
playback.dispose();
```

## Expected result

Playback pauses, seeks to the halfway/details position, resumes faster, and resolves when finished. Check every operation result in production code.

## Common mistakes

Using a fallback controller, controlling terminal playback, or expecting `dispose()` to cancel.

## Related pages

- [Controller guide](../guides/playback-controllers.md)
- [Controller reference](../reference/playback-controller.md)
