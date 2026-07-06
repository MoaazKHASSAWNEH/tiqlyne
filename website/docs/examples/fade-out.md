---
sidebar_position: 3
---

# Fade out

## Goal

Fade a notification from opacity `1` to `0`.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

```html
<div id="notification" role="status">Saved</div>
```

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const element = document.querySelector('#notification');
if (!element) throw new Error('Notification not found');

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);
const motion = createMotionEngine<Element>({ registry, driver: new WebMotionDriver() });

const result = await motion.play(element, {
  id: 'notification-exit',
  type: 'fade-out',
  duration: 180,
  easing: 'ease-in',
  options: { fromOpacity: 1, toOpacity: 0 }
});
```

## Expected result

The notification becomes transparent. Removing it from the DOM after playback remains application responsibility. `fromOpacity` must exceed `toOpacity`.

## Common mistakes

Removing the node before awaiting the result or reversing the opacity values.

## Related pages

- [Basic pack reference](../reference/basic-pack.md)
