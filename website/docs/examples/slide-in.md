---
sidebar_position: 4
---

# Slide in

## Goal

Move a panel from the right while fading it in, with a reduced-motion fallback.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

```html
<aside id="panel" aria-label="Details">Details</aside>
```

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const element = document.querySelector('#panel');
if (!element) throw new Error('Panel not found');

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);
const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver({
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches
  })
});

await motion.play(element, {
  id: 'panel-enter',
  type: 'slide-in',
  duration: 300,
  easing: 'ease-out',
  reducedMotionStrategy: 'simplify',
  options: { direction: 'right', distance: 32, fade: true }
});
```

## Expected result

The normal animation moves 32 px from the right. Reduced motion uses the pack's short opacity-only timeline. Directions are `left`, `right`, `top`, and `bottom`.

## Common mistakes

Assuming the driver observes preference changes or using an unsupported direction.

## Related pages

- [Reduced motion](../reference/reduced-motion.md)
- [Basic pack](../reference/basic-pack.md)
