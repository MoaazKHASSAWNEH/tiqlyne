---
sidebar_position: 6
---

# Composition example

A composition combines registered motions into a sequence.

## What this example demonstrates

This example combines an appearance motion with an entrance motion.

It uses:

- composition defaults;
- the `fade-in` motion;
- the `slide-in` motion;
- a delayed start for the second motion.

## When to use it

Use compositions when you want to combine reusable motion definitions without writing low-level timeline steps manually.

For very custom keyframes, use a direct timeline instead.

```ts
import { createMotionComposition } from '@tiqlyne/motion-core';

const composition = createMotionComposition((composition) => {
  composition.motion('fade-in', { defaults: { duration: 200 } });
  composition.motion('slide-in', {
    at: 150,
    defaults: { duration: 300 },
    options: { direction: 'bottom', distance: 24, fade: false }
  });
});

const result = await motion.playComposition(element, composition);
```
