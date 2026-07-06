---
sidebar_position: 9
---

# Respect reduced motion

## Goal

Use `slide-in` normally and its simplified opacity timeline when the user prefers reduced motion.

## Prerequisites

Install core, Web, and the basic pack.

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const element = document.querySelector('#panel');
if (!element) throw new Error('Panel not found');
const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);
const driver = new WebMotionDriver({ reducedMotion: preference.matches });
const motion = createMotionEngine<Element>({ registry, driver });

const result = await motion.play(element, {
  id: 'panel-enter',
  type: 'slide-in',
  respectReducedMotion: true,
  reducedMotionStrategy: 'simplify',
  options: { direction: 'right', distance: 48, fade: true }
});
```

`skip` avoids playback, `simplify` uses a definition fallback or the Web generic fallback, and `preserve` runs the original timeline. The driver does not monitor media-query changes automatically.

## What you learned

Reduced motion combines config policy, optional definition output, and driver preference.

## Next steps

Learn [diagnostics debugging](./diagnostics-debugging.md). See [reduced-motion reference](../reference/reduced-motion.md).
