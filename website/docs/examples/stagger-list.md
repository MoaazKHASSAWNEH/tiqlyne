---
sidebar_position: 9
---

# Staggered list example

## Goal

Animate every matching list item with a 60 ms offset.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web
```

```html
<ul id="results">
  <li class="result">Core</li>
  <li class="result">Web</li>
  <li class="result">Basic pack</li>
</ul>
```

```ts
import { createMotionEngine, createMotionTimeline } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const root = document.querySelector('#results');
if (!root) throw new Error('Results list not found');

const timeline = createMotionTimeline((timeline) => {
  timeline.track({ type: 'selector', selector: '.result' }, (track) => {
    track.stagger({ each: 60, from: 'start' });
    track.step({ duration: 220, easing: 'ease-out', fill: 'both' }, (step) => {
      step.from({ opacity: 0, transform: { y: 12 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});

const motion = createMotionEngine<Element>({ driver: new WebMotionDriver() });
await motion.playTimeline(root, timeline);
```

## Expected result

The selector resolves all three descendants. Their scheduled delays increase by 60 ms. Use `from: 'end'` or `center` for a different order.

## Common mistakes

Using a selector outside the root or expecting stagger to create elements.

## Related pages

- [Multiple tracks and steps](../guides/multiple-tracks-and-steps.md)
