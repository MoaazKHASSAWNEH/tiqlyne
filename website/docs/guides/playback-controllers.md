---
sidebar_position: 5
---

# Playback controllers

Playback controllers let you control an animation after it has started.

Use them for interactive previews, UI controls, timeline editors, demos and advanced animation workflows.

## Create a controller from a registered motion

```ts
const playback = motion.createPlayback(element, {
  type: 'fade-in',
  trigger: 'manual'
});
```

## Create a controller from a timeline

```ts
const playback = motion.createTimelinePlayback(element, timeline);
```

## Create a controller from a composition

```ts
const playback = motion.createCompositionPlayback(element, composition);
```

## Basic controls

```ts
await playback.pause();
await playback.resume();
await playback.finish();
await playback.cancel();
```

## Playback state

```ts
console.log(playback.status);
console.log(playback.disposed);
console.log(playback.getState());
```

## Finished promise

```ts
const result = await playback.finished;

console.log(result.status);
console.log(result.reason);
```

## Seek by time

```ts
await playback.seek(250);
```

## Seek by progress

```ts
await playback.seekProgress(0.5);
```

## Jump to a label

```ts
await playback.jumpToLabel('settled');
```

Labels are defined on timelines.

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.label('start', 0);
  timeline.label('settled', 500);
});
```

## Direction

```ts
await playback.playForward();
await playback.playBackward();
```

## Playback rate

```ts
await playback.setPlaybackRate(1.5);
```

## Events

```ts
const unsubscribe = playback.on('finish', (event) => {
  console.log(event.type);
  console.log(event.status);
});

unsubscribe();
```

## Listen once

```ts
playback.once('cancel', (event) => {
  console.log('Cancelled', event);
});
```

## Dispose

```ts
playback.dispose();
```

Disposing removes controller listeners and marks the controller as no longer active.

## Driver support

Some operations depend on the active driver.

The Web driver supports controller operations through the Web Animations API where the browser allows it.

## Common use cases

Playback controllers are useful for:

- preview panels;
- pause and resume buttons;
- animation scrubbers;
- timeline editors;
- demos;
- tests;
- accessibility-aware playback;
- debugging playback behavior.
