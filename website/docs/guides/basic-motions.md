---
sidebar_position: 3
---

# Basic motions

Register the complete 0.1.0 pack once, then play one of its three types.

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

const motion = createMotionEngine<Element>({ registry, driver: new WebMotionDriver() });

await motion.play(element, {
  id: 'message-enter',
  type: 'fade-in',
  options: { fromOpacity: 0, toOpacity: 1 }
});

await motion.play(element, {
  id: 'message-exit',
  type: 'fade-out',
  options: { fromOpacity: 1, toOpacity: 0 }
});

await motion.play(element, {
  id: 'panel-enter',
  type: 'slide-in',
  options: { direction: 'left', distance: 32, fade: true }
});
```

Invalid fade ordering fails during planning with reason `invalid-motion-options`. Option values are normalized by their schemas; consult the [basic package page](../packages/motion-pack-basic.md) for exact ranges and generated timelines.
