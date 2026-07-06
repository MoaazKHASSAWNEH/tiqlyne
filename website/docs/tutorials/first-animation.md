---
sidebar_position: 2
---

# Your first animation

## Goal

Fade one element into view with the official Web driver and basic pack.

## Prerequisites

Install Node.js, pnpm, and the three public packages:

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

## 1. Add the target

```html
<div id="welcome">Welcome to Tiqlyne</div>
```

## 2. Create the engine and play

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const element = document.querySelector('#welcome');
if (!element) throw new Error('Welcome element not found');

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);
const motion = createMotionEngine<Element>({ registry, driver: new WebMotionDriver() });

const result = await motion.play(element, { id: 'welcome-enter', type: 'fade-in' });
console.log(result.status);
```

## What you learned

The registry provides the `fade-in` definition, the engine plans it, and `WebMotionDriver` executes it with WAAPI.

## Next steps

Continue with [Web engine setup](./web-engine-setup.md) and the [fade-in example](../examples/fade-in.md).
