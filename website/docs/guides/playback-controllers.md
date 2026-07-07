---
sidebar_position: 8
---

# Playback controllers

Use a controller when UI must pause, scrub, reverse, cancel, or observe playback. For fire-and-wait behavior, `play`/`playTimeline` is simpler.

## Before you start

Controllers represent stateful playback. Keep one controller per active UI interaction, inspect the result of every async operation, and dispose listeners when the owning view is torn down. If you only need a final result, prefer `await motion.play(...)`.

```ts
const playback = motion.createPlayback(element, {
  id: 'interactive-fade',
  type: 'fade-in'
});
```

Controllers can also come from `createTimelinePlayback` and `createCompositionPlayback`.

| Need                            | Method or property                          |
| ------------------------------- | ------------------------------------------- |
| Start in either direction       | `playForward()`, `playBackward()`           |
| Temporarily stop and continue   | `pause()`, `resume()`                       |
| Scrub                           | `seek()`, `seekProgress()`, `jumpToLabel()` |
| Observe completion              | `finished`                                  |
| Render current controller state | `getState()`                                |
| Release listeners               | `dispose()`                                 |

## Complete UI example

```html
<button id="play">Play</button>
<button id="pause">Pause</button>
<button id="resume">Resume</button>
<button id="details">Details</button>
<button id="cancel">Cancel</button>
<button id="finish">Finish</button>
<input id="progress" type="range" min="0" max="1" step="0.01" value="0" />
<output id="status">idle</output>
<div id="preview">Preview</div>
```

```ts
import { createMotionEngine, createMotionTimeline } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const target = document.querySelector('#preview');
const status = document.querySelector<HTMLOutputElement>('#status');
const progress = document.querySelector<HTMLInputElement>('#progress');
if (!target || !status || !progress) throw new Error('Controller UI is incomplete');

const motion = createMotionEngine<Element>({ driver: new WebMotionDriver() });
const timeline = createMotionTimeline((timeline) => {
  timeline.label('details', 300);
  timeline.track('self', (track) => {
    track.step({ duration: 600, fill: 'both' }, (step) => {
      step.from({ opacity: 0, transform: { y: 20 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});

let playback = motion.createTimelinePlayback(target, timeline);
let unsubscribe = playback.on('statusChange', (event) => {
  status.value = event.status;
});

document.querySelector('#play')?.addEventListener('click', async () => {
  unsubscribe();
  playback.dispose();
  playback = motion.createTimelinePlayback(target, timeline);
  unsubscribe = playback.on('statusChange', (event) => (status.value = event.status));
  await playback.playForward();
});
document.querySelector('#pause')?.addEventListener('click', async () => {
  await playback.pause();
});
document.querySelector('#resume')?.addEventListener('click', async () => {
  await playback.resume();
});
document.querySelector('#details')?.addEventListener('click', async () => {
  await playback.jumpToLabel('details');
});
document.querySelector('#cancel')?.addEventListener('click', async () => {
  await playback.cancel();
});
document.querySelector('#finish')?.addEventListener('click', async () => {
  await playback.finish();
});
progress.addEventListener('input', async () => {
  await playback.seekProgress(progress.valueAsNumber);
});
```

Use `await playback.seek(250)` for absolute time, `playBackward()` for reverse playback, and `setPlaybackRate(1.5)` for speed. Read `playback.getState()` when rendering a scrubber. Inspect every operation result because unsupported actions and invalid transitions are represented as skipped results.

`playback.finished` resolves with the playback outcome. `dispose()` removes event listeners but does not cancel animations; call `cancel()` first when teardown must also stop motion.

## Common mistakes

- Calling `resume` before `pause`.
- Calling controls after a terminal status.
- Ignoring the returned result from an async control.
- Expecting the promise fallback controller to seek.
- Expecting `finish` to work on infinite animations.

## Related pages

- [Controller reference](../reference/playback-controller.md)
- [Events](./events.md)
- [Labels](./labels.md)
- [Controller example](../examples/playback-controller.md)
