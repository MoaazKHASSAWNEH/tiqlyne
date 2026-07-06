---
sidebar_position: 10
---

# Reduced-motion example

## Goal

Simplify `slide-in` when the current browser preference requests reduced motion.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

```html
<aside id="settings-panel">Settings</aside>
```

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const media = window.matchMedia('(prefers-reduced-motion: reduce)');
const element = document.querySelector('#settings-panel');
if (!element) throw new Error('Settings panel not found');

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver({ reducedMotion: media.matches })
});

const result = await motion.play(element, {
  id: 'settings-panel-enter',
  type: 'slide-in',
  respectReducedMotion: true,
  reducedMotionStrategy: 'simplify',
  options: { direction: 'right', distance: 48, fade: true }
});
```

## Expected result

With reduced motion off, the panel slides and fades. With it on, `SlideInMotion` supplies a short opacity-only timeline. Recreate the driver/engine when `media.matches` changes if live preference updates matter.

## Common mistakes

Assuming media-query changes are observed automatically or using `preserve` while expecting simplification.

## Related pages

- [Reduced motion reference](../reference/reduced-motion.md)
