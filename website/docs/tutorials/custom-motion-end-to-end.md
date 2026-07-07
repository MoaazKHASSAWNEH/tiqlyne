---
sidebar_position: 11
---

# Create and use a custom motion end to end

This tutorial follows one motion from its option schema to browser playback and diagnostics. Work through it in order the first time; each stage becomes a reusable boundary in an application motion library.

## Quick map

1. Define options.
2. Build the definition.
3. Register it.
4. Play it.
5. Debug it.

## 1. Goal

Create a typed `rise-in` motion, validate its options, provide an accessible reduced-motion alternative, register it, and play it in a browser.

## 2. What you will build

`RiseInMotion` moves a target upward into place while increasing its opacity. Its public options are:

- `distance`: the vertical distance in pixels;
- `fromOpacity`: the initial opacity;
- `toOpacity`: the final opacity.

The definition produces symbolic timelines. It does not access the DOM; `WebMotionDriver` resolves the symbolic `self` target against the element passed at playback time.

## 3. Prerequisites

Install the three public packages:

```bash npm2yarn
npm install @tiqlyne/motion-core @tiqlyne/motion-web @tiqlyne/motion-pack-basic
```

This tutorial assumes a TypeScript browser application and familiarity with [engine setup](../guides/engine-setup.md) and [timeline builders](../reference/timeline-builder.md).

## 4. Recommended file structure

```text
src/
├── main.ts
├── motion/
│   └── create-app-motion-engine.ts
└── motions/
    ├── register-app-motions.ts
    └── rise-in.motion.ts
```

Keep definitions independent from the browser entry point. The registration helper then acts as your application motion pack.

## 5. Create the option schema

Start `src/motions/rise-in.motion.ts` with a schema. Builder metadata such as `min`, `max`, and `step` describes and normalizes each value.

```ts
import {
  SchemaMotionDefinition,
  createMotionTimeline,
  defineMotionOptions,
  option,
  validateIncreasing,
  type InferMotionOptions,
  type MotionBuildContext,
  type MotionCategory,
  type MotionTimelineDefinition
} from '@tiqlyne/motion-core';

const riseInOptions = defineMotionOptions({
  distance: option.range({
    label: 'Distance',
    description: 'Vertical movement distance in pixels.',
    defaultValue: 24,
    min: 0,
    max: 300,
    step: 1,
    unit: 'px'
  }),
  fromOpacity: option.range({
    label: 'From opacity',
    defaultValue: 0,
    min: 0,
    max: 1,
    step: 0.05,
    unit: 'none'
  }),
  toOpacity: option.range({
    label: 'To opacity',
    defaultValue: 1,
    min: 0,
    max: 1,
    step: 0.05,
    unit: 'none'
  })
});

type RiseInOptions = InferMotionOptions<typeof riseInOptions.schema>;
```

`InferMotionOptions` derives the TypeScript option type from the schema. `SchemaMotionDefinition` later uses the same schema for defaults and normalization, so runtime behavior and types stay aligned.

## 6. Create the motion definition class

Add the class below the schema:

```ts
export class RiseInMotion extends SchemaMotionDefinition<typeof riseInOptions.schema> {
  readonly type = 'rise-in';
  readonly label = 'Rise in';
  readonly description = 'Moves the target upward into place while fading it in.';
  readonly category: MotionCategory = 'entrance';

  protected readonly options = riseInOptions;

  buildTimeline(context: MotionBuildContext<RiseInOptions>): MotionTimelineDefinition {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step(
          {
            duration: context.duration,
            delay: context.delay,
            easing: context.easing,
            fill: 'both'
          },
          (step) => {
            step.from({
              opacity: context.options.fromOpacity,
              transform: { y: context.options.distance }
            });
            step.to({
              opacity: context.options.toOpacity,
              transform: { y: 0 }
            });
          }
        );
      });
    });
  }
}
```

The definition receives normalized options and resolved timing values through `MotionBuildContext`. It returns a platform-independent `MotionTimelineDefinition` rather than executing an animation.

## 7. Add option validation

Opacity must increase for this entrance motion. Add a cross-field validator inside the class:

```ts
// Excerpt: add this member to RiseInMotion.
abstract class RiseInMotionExcerpt extends SchemaMotionDefinition<typeof riseInOptions.schema> {
  protected override readonly optionValidators = [
    validateIncreasing('fromOpacity', 'toOpacity', 'Rise opacity must increase')
  ];
}
```

Schema normalization runs before these validators. If a validator returns a message, engine planning fails with reason `invalid-motion-options`; `play` returns that failure and its diagnostics instead of asking the driver to animate.

## 8. Add a reduced-motion timeline

Add an opacity-only alternative to the class:

```ts
// Excerpt: add this member to RiseInMotion.
abstract class RiseInMotionExcerpt extends SchemaMotionDefinition<typeof riseInOptions.schema> {
  override buildReducedMotionTimeline(
    context: MotionBuildContext<RiseInOptions>
  ): MotionTimelineDefinition {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step(
          {
            duration: Math.min(context.duration, 150),
            delay: context.delay,
            easing: context.easing,
            fill: 'both'
          },
          (step) => {
            step.from({ opacity: context.options.fromOpacity });
            step.to({ opacity: context.options.toOpacity });
          }
        );
      });
    });
  }
}
```

This method does not force reduced motion. The engine uses it only when the configured reduced-motion strategy calls for a simplified timeline. See [Reduced motion](../guides/reduced-motion.md) for the exact policy.

## 9. Register the motion before engine creation

Register definitions on a registry when assembling an engine:

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';
import { registerAppMotions } from '../motions/register-app-motions';

const registry = new DefaultMotionRegistry();

registerBasicMotions(registry);
registerAppMotions(registry);

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver()
});
```

This is the preferred assembly pattern when all available motions are known during application startup.

## 10. Register the motion after engine creation

When an engine already exists, register directly through it:

```ts
motion.register(new RiseInMotion());
```

Do not run this after the same type has already been added by `registerAppMotions`: duplicate types throw. Treat this as an alternative registration style.

## 11. Register multiple motions

Use the engine for a collection:

```ts
motion.registerMany([new RiseInMotion()]);
```

`MotionRegistry` does not expose `registerMany`. `registerMany` belongs to `MotionEngine`; a registry-based pack registers each definition with `registry.register`.

## 12. Create an application motion pack

Create `src/motions/register-app-motions.ts`:

```ts
import type { MotionRegistry } from '@tiqlyne/motion-core';
import { RiseInMotion } from './rise-in.motion';

export function registerAppMotions(registry: MotionRegistry): void {
  registry.register(new RiseInMotion());
}
```

This helper centralizes the application's motion vocabulary without creating a new package. Add further definitions as additional `registry.register(...)` calls.

## 13. Create the engine

Create `src/motion/create-app-motion-engine.ts`:

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';
import { registerAppMotions } from '../motions/register-app-motions';

export function createAppMotionEngine() {
  const registry = new DefaultMotionRegistry();

  registerBasicMotions(registry);
  registerAppMotions(registry);

  return createMotionEngine<Element>({
    registry,
    driver: new WebMotionDriver()
  });
}
```

Only public package entry points are used. Imports into your own `src` directory are application-local and safe.

## 14. Play the custom motion

Pass the browser element separately from the symbolic config:

```ts
const element = document.querySelector<HTMLElement>('[data-hero]');

if (!element) {
  throw new Error('Hero element not found');
}

await motion.play(element, {
  id: 'hero-rise',
  type: 'rise-in',
  trigger: 'manual',
  options: {
    distance: 32,
    fromOpacity: 0,
    toOpacity: 1
  }
});
```

The engine normalizes the config, finds `rise-in`, normalizes and validates its options, builds and validates its timeline, and creates an execution plan. The Web driver then resolves `self` to `element` at playback time.

## 15. Debug invalid options

Inspect the result instead of assuming playback succeeded:

```ts
const result = await motion.play(element, {
  id: 'bad-rise',
  type: 'rise-in',
  options: {
    fromOpacity: 1,
    toOpacity: 0
  }
});

if (result.status === 'failed') {
  console.log(result.reason);
  console.log(result.diagnostics);
}
```

Here, `validateIncreasing` emits a message, so the reason is `invalid-motion-options`. Diagnostics contain the structured planning details. See [Diagnostics](../reference/diagnostics.md) for codes and sources.

## 16. Inspect the definition

Definitions can be inspected without a browser:

```ts
import { inspectMotionTimeline } from '@tiqlyne/motion-core';
import { RiseInMotion } from './motions/rise-in.motion';

const definition = new RiseInMotion();
const defaults = definition.getDefaultOptions();
const options = definition.normalizeOptions({ distance: 32 });
const validationMessages = definition.validateOptions(options);

const timeline = definition.buildTimeline({
  options,
  duration: 300,
  delay: 0,
  easing: 'ease-out',
  trigger: 'manual'
});

console.log({ defaults, options, validationMessages });
console.log(inspectMotionTimeline(timeline));
```

`optionDefinitions` is also available for builder UIs and documentation tooling. The inspector summarizes duration, tracks, steps, targets, properties, labels, and diagnostics.

## 17. Final code

The preceding sections contain the complete definition, pack, and engine factory. Wire them together in `src/main.ts`:

```ts
import { createAppMotionEngine } from './motion/create-app-motion-engine';

const motion = createAppMotionEngine();
const element = document.querySelector<HTMLElement>('[data-hero]');

if (!element) {
  throw new Error('Hero element not found');
}

const result = await motion.play(element, {
  id: 'hero-rise',
  type: 'rise-in',
  trigger: 'manual',
  options: {
    distance: 32,
    fromOpacity: 0,
    toOpacity: 1
  }
});

if (result.status === 'failed') {
  console.error(result.reason, result.diagnostics);
}
```

## 18. What you learned

You created typed and normalized options, added cross-field validation, built main and reduced timelines, registered one or many definitions, assembled an application pack, played the motion, and inspected failures and generated data.

## 19. Next steps

- Add another definition to `registerAppMotions`.
- Use `option.select` or `option.color` for richer schemas.
- Inspect the planned motion with `motion.plan(...)` before playback.
- Read the custom driver tutorial only if you need a runtime other than the supplied Web driver.

## 20. Related pages

- [Custom motion definition tutorial](./custom-motion-definition.md)
- [Custom motion definition guide](../guides/custom-motion-definition.md)
- [Registered motions](../guides/registered-motions.md)
- [Motion definition reference](../reference/motion-definition.md)
- [Motion registry reference](../reference/motion-registry.md)
- [Motion options](../reference/motion-options.md)
- [Timeline builder](../reference/timeline-builder.md)
