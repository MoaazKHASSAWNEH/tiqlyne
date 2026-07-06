---
sidebar_position: 2
---

# Fade in

## Goal

Fade a dialog from opacity `0` to `1`.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

```html
<section id="dialog" role="dialog" aria-label="Welcome">Welcome</section>
```

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const element = document.querySelector('#dialog');
if (!element) throw new Error('Dialog not found');

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);
const motion = createMotionEngine<Element>({ registry, driver: new WebMotionDriver() });

const result = await motion.play(element, {
  id: 'dialog-enter',
  type: 'fade-in',
  duration: 200,
  easing: 'ease-out',
  options: { fromOpacity: 0, toOpacity: 1 }
});
```

## Expected result

The dialog reaches full opacity and the result normally reports `finished`. `fromOpacity` must be lower than `toOpacity`.

## Common mistakes

Forgetting to register the pack, omitting `id`, or reversing the opacity values.

## Related pages

- [Basic pack reference](../reference/basic-pack.md)
