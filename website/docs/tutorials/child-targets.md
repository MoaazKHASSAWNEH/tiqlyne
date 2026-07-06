---
sidebar_position: 5
---

# Animate child targets

## Goal

Animate a card title without selecting it in application code.

## Prerequisites

Use a configured Web engine and understand [direct timelines](../guides/direct-timelines.md).

```html
<article id="profile-card" aria-labelledby="profile-title">
  <h2 id="profile-title" data-motion-child="title">Profile</h2>
  <p>Account details</p>
</article>
```

```ts
import { createMotionTimeline } from '@tiqlyne/motion-core';

const timeline = createMotionTimeline((timeline) => {
  timeline.track({ type: 'child', name: 'title' }, (track) => {
    track.step({ duration: 240, fill: 'both' }, (step) => {
      step.from({ opacity: 0, transform: { y: 8 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});

const card = document.querySelector('#profile-card');
if (!card) throw new Error('Profile card not found');
await motion.playTimeline(card, timeline);
```

`child` resolves only the first matching descendant. A missing target fails with `target-not-found`.

## What you learned

Core stores symbolic targets; the Web driver resolves `data-motion-child` relative to the root.

## Next steps

Animate a [staggered list](./staggered-list.md). See [motion targets](../reference/motion-targets.md).
