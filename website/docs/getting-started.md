---
sidebar_position: 2
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

playback.pause();
playback.resume();
playback.setPlaybackRate(1.5);
playback.finish();
```

## Next steps

Continue with:

- Installation
- Core concepts
- Architecture overview
- Registered motions
- Direct timelines
- Playback controllers
