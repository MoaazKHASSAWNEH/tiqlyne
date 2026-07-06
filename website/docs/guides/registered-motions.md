---
sidebar_position: 2
---

# Registered motions

Registered motions are reusable animation definitions stored in a motion registry.

They allow you to play animations by type instead of manually creating timelines every time.

```mermaid
flowchart LR
  Registry["Motion registry"] --> Definition["Motion definition"]
  Config["Motion config"] --> Engine["Motion engine"]
  Engine --> Registry
  Definition --> Timeline["Built timeline"]
```

## Create a registry

```ts
import { DefaultMotionRegistry } from '@tiqlyne/motion-core';

const registry = new DefaultMotionRegistry();
```

## Register the basic pack

```ts
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';

registerBasicMotions(registry);
```

The basic pack registers:

- `fade-in`
- `fade-out`
- `slide-in`

## Create an engine with a registry

```ts
import { createMotionEngine } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver()
});
```

## Play a registered motion

```ts
await motion.play(element, {
  id: 'fade-example',
  type: 'fade-in',
  trigger: 'manual'
});
```

## Pass motion options

Each motion can define its own options.

```ts
await motion.play(element, {
  id: 'slide-example',
  type: 'slide-in',
  trigger: 'manual',
  options: {
    direction: 'bottom',
    distance: 32,
    fade: true
  }
});
```

## Override timing

You can override timing values per motion call.

```ts
await motion.play(element, {
  id: 'slow-fade-example',
  type: 'fade-in',
  trigger: 'manual',
  duration: 500,
  delay: 100,
  easing: 'ease-out'
});
```

## Check if a motion exists

```ts
if (registry.has('slide-in')) {
  await motion.play(element, {
    id: 'conditional-slide-example',
    type: 'slide-in',
    trigger: 'manual'
  });
}
```

## Get a registered definition

```ts
const definition = registry.get('fade-in');

console.log(definition);
```

## List all registered motions

```ts
const definitions = registry.getAll();

console.log(definitions);
```

## Filter by category

```ts
const entranceMotions = registry.getByCategory('entrance');

console.log(entranceMotions);
```

## Why use registered motions?

Registered motions are useful when you want to:

- reuse animation behavior;
- expose animations in a builder UI;
- validate options;
- keep animations consistent;
- separate animation authoring from animation execution;
- create reusable packs.

## Registered motion vs direct timeline

Use a registered motion when the animation is reusable.

Use a direct timeline when the animation is specific to one case.

| Approach          | Best for                            |
| ----------------- | ----------------------------------- |
| Registered motion | Reusable animation behaviors.       |
| Direct timeline   | One-off custom animation sequences. |
