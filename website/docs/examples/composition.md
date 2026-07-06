---
sidebar_position: 10
---

# Composition

## Goal

Combine `fade-in` and `slide-in` into one reusable entrance sequence.

## Install

```bash
pnpm add @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

```html
<main id="page">Composed entrance</main>
```

```ts
import {
  createMotionComposition,
  createMotionEngine,
  DefaultMotionRegistry
} from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const element = document.querySelector('#page');
if (!element) throw new Error('Page not found');
const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);
const motion = createMotionEngine<Element>({ registry, driver: new WebMotionDriver() });

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

## Expected result

Fade begins immediately and slide begins at 150 ms. Unknown types or invalid options produce composition planning failures.

## Common mistakes

Compiling with a registry that lacks the referenced definitions or confusing compositions with nested timelines.

Related: [Compositions guide](../guides/compositions.md) and [composition builder](../reference/composition-builder.md).
