---
sidebar_position: 2
slug: /getting-started
---

# Getting started

This guide shows the minimal setup needed to create a Tiqlyne Motion Engine instance, register the official basic motions, and play an animation in the browser.

## Basic setup

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';

const registry = new DefaultMotionRegistry();

registerBasicMotions(registry);

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver(),
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});
```

## Play a registered motion

```ts
const element = document.querySelector('.card');

if (!element) {
  throw new Error('Target element not found.');
}

await motion.play(element, {
  id: 'card-enter',
  type: 'slide-in',
  trigger: 'manual',
  options: {
    direction: 'bottom',
    distance: 24,
    fade: true
  }
});
```

## Use a direct timeline

You can also create a timeline directly without using a registered motion.

```ts
import { createMotionTimeline } from '@tiqlyne/motion-core';

const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({
    duration: 500,
    easing: 'ease-out',
    fill: 'both'
  });

  timeline.track('self', (track) => {
    track.step({}, (step) => {
      step.from({
        opacity: 0,
        transform: {
          y: 24
        }
      });

      step.to({
        opacity: 1,
        transform: {
          y: 0
        }
      });
    });
  });
});

await motion.playTimeline(element, timeline);
```

## Create a playback controller

Playback controllers give you more control over a running animation.

```ts
const playback = motion.createTimelinePlayback(element, timeline);

await playback.pause();
await playback.resume();
await playback.setPlaybackRate(1.5);
await playback.finish();
```

## Next steps

Continue with:

- [Installation](./installation.md)
- [Core concepts](./core-concepts.md)
- [Learning path](./learning-path.md)
- [Registered motions](../guides/registered-motions.md)
- [Direct timelines](../guides/direct-timelines.md)
- [Playback controllers](../guides/playback-controllers.md)
