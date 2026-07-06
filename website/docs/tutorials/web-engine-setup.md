---
sidebar_position: 3
---

# Set up a Web engine

## Goal

Create a reusable browser engine with defaults, the basic pack, and the current reduced-motion preference.

## Prerequisites

Complete [Your first animation](./first-animation.md).

## Build the shared engine

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

export const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }),
  defaults: { duration: 300, easing: 'ease-out', fill: 'both' }
});
```

The driver preference is a snapshot. Recreate the driver when the media query changes if live updates matter.

## Verify registration

```ts
console.log(motion.has('fade-in')); // true
console.log(motion.getByCategory('entrance'));
```

## What you learned

Engine defaults reduce repetition, while configs and steps can override them.

## Next steps

Build [an animated card](./animate-a-card.md). See [engine setup](../guides/engine-setup.md) and [Web driver reference](../reference/web-motion-driver.md).
