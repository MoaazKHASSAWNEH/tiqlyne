---
sidebar_position: 7
---

# Build a composition

## Goal

Combine registered motions into one page entrance without duplicating keyframes.

## Prerequisites

Use an engine with the basic pack registered.

```ts
import { createMotionComposition } from '@tiqlyne/motion-core';

const element = document.querySelector('#page');
if (!element) throw new Error('Page not found');

const entrance = createMotionComposition((composition) => {
  composition.defaults({ easing: 'ease-out', fill: 'both' });
  composition.motion('fade-in', { defaults: { duration: 180 } });
  composition.motion('slide-in', {
    at: 120,
    defaults: { duration: 320 },
    options: { direction: 'bottom', distance: 24, fade: false }
  });
});

const result = await motion.playComposition(element, entrance);
```

The registry resolves both motion types; the compiler merges their tracks into a timeline before planning.

## What you learned

Compositions orchestrate reusable definitions. Direct timelines remain better for tightly coupled custom keyframes.

## Next steps

Add [playback controls](./playback-controls.md). See the [composition guide](../guides/compositions.md).
