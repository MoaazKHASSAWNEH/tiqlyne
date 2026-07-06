---
sidebar_position: 11
---

# Custom motion definitions

Custom definitions turn application animation patterns into typed, reusable motion types. They describe symbolic timelines; the active driver resolves targets and performs playback.

## When to create a custom motion

Create a definition when a motion should have a stable name, shared defaults, validated options, or an accessibility-specific alternative. Prefer a [direct timeline](./direct-timelines.md) for a one-off sequence that does not belong in the application's motion vocabulary.

## Custom motion lifecycle

For `motion.play(target, config)`, the engine:

1. normalizes the motion config;
2. finds its normalized `type` in the registry;
3. normalizes and validates the definition's options;
4. builds the main timeline and, for the `simplify` strategy, any definition-provided reduced timeline;
5. applies defaults and validates the generated timelines;
6. creates an execution plan;
7. asks the driver to resolve targets and play it.

A definition never receives the DOM target. Its `MotionBuildContext` contains only options, timing, easing, and trigger data.

## Recommended file structure

```text
src/
├── motion/
│   └── create-app-motion-engine.ts
└── motions/
    ├── register-app-motions.ts
    └── rise-in.motion.ts
```

Keep definitions and registration separate so definitions remain easy to test and the application pack remains easy to audit.

## Create typed options

```ts
import { defineMotionOptions, option, type InferMotionOptions } from '@tiqlyne/motion-core';

const riseInOptions = defineMotionOptions({
  distance: option.range({
    label: 'Distance',
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

The public builders also include `option.number`, `option.string`, `option.boolean`, `option.select`, and `option.color`.

## Normalize options

`SchemaMotionDefinition` connects the schema to `getDefaultOptions`, `optionDefinitions`, and `normalizeOptions`. Normalization handles unknown input before the timeline is built.

```ts
const definition = new RiseInMotion();

definition.getDefaultOptions();
definition.normalizeOptions({ distance: 48 });
```

Schema constraints normalize individual values. Metadata such as a range's `step` should not be treated as a cross-field business rule.

## Validate custom options

Use definition validators for relationships between normalized values:

```ts
import { validateIncreasing } from '@tiqlyne/motion-core';

protected override readonly optionValidators = [
  validateIncreasing('fromOpacity', 'toOpacity', 'Rise opacity must increase')
];
```

The engine treats returned validation messages as `invalid-motion-options`. Other public helpers cover decreasing, different, greater-than, greater-than-or-equal, less-than, and less-than-or-equal relationships.

## Build the main timeline

```ts
import {
  SchemaMotionDefinition,
  createMotionTimeline,
  validateIncreasing,
  type MotionBuildContext,
  type MotionCategory,
  type MotionTimelineDefinition
} from '@tiqlyne/motion-core';

export class RiseInMotion extends SchemaMotionDefinition<typeof riseInOptions.schema> {
  readonly type = 'rise-in';
  readonly label = 'Rise in';
  readonly description = 'Moves the target upward into place while fading it in.';
  readonly category: MotionCategory = 'entrance';

  protected readonly options = riseInOptions;

  protected override readonly optionValidators = [
    validateIncreasing('fromOpacity', 'toOpacity', 'Rise opacity must increase')
  ];

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
            step.to({ opacity: context.options.toOpacity, transform: { y: 0 } });
          }
        );
      });
    });
  }
}
```

`self` is symbolic. The definition must not query the DOM, access a framework, or instantiate Web Animations API objects.

## Build a reduced-motion timeline

Spatial motion should usually provide a non-spatial alternative:

```ts
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
```

The engine selects this timeline only when its configured reduced-motion strategy requires simplification. Defining the method does not enable the strategy by itself.

## Register before engine creation

Use the registry while assembling dependencies:

```ts
registry.register(new RiseInMotion());
```

This is useful for startup registration and pack helpers.

## Register after engine creation

Use the engine if it already exists:

```ts
motion.register(new RiseInMotion());
```

Both paths use the same underlying registry. Duplicate types throw rather than replacing an existing definition.

## Register multiple custom motions

Register a collection through the engine:

```ts
motion.registerMany([new RiseInMotion()]);
```

`MotionRegistry` has no `registerMany` method. Pack helpers must call `registry.register` for each definition.

## Build an application motion pack

```ts
import type { MotionRegistry } from '@tiqlyne/motion-core';
import { RiseInMotion } from './rise-in.motion';

export function registerAppMotions(registry: MotionRegistry): void {
  registry.register(new RiseInMotion());
}
```

Compose the official and application packs before creating the engine:

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const registry = new DefaultMotionRegistry();

registerBasicMotions(registry);
registerAppMotions(registry);

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver()
});
```

## Use the custom motion

```ts
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

The definition must be registered before the call. Every `MotionConfig` also needs a stable `id`.

## Debug invalid options

```ts
const result = await motion.play(element, {
  id: 'bad-rise',
  type: 'rise-in',
  options: { fromOpacity: 1, toOpacity: 0 }
});

if (result.status === 'failed') {
  console.log(result.reason);
  console.log(result.diagnostics);
}
```

Use the failure reason for control flow and diagnostics for structured debugging context.

## Inspect defaults and normalized options

```ts
import { inspectMotionTimeline } from '@tiqlyne/motion-core';

const definition = new RiseInMotion();
const defaults = definition.getDefaultOptions();
const options = definition.normalizeOptions({ distance: 32 });
const messages = definition.validateOptions(options);
const timeline = definition.buildTimeline({
  options,
  duration: 300,
  delay: 0,
  easing: 'ease-out',
  trigger: 'manual'
});

console.log({ defaults, options, messages });
console.log(inspectMotionTimeline(timeline));
```

You can also inspect `definition.optionDefinitions` or call `motion.plan(config)` to inspect the engine's complete execution plan.

## Custom motion checklist

- Stable kebab-case type.
- Clear label.
- Clear description.
- Correct category.
- Typed option schema.
- Sensible defaults.
- Normalization.
- Validators when values depend on each other.
- Main timeline.
- Reduced-motion timeline when spatial motion exists.
- No DOM access.
- No framework access.
- Registered before use.
- Played with `id` and `type`.
- Diagnostics checked for invalid options.

## Common mistakes

- Calling `registry.registerMany`; the method exists only on the engine.
- Registering the same type through both a pack and `motion.register`.
- Accessing DOM elements inside a definition instead of using symbolic targets.
- Assuming option metadata replaces cross-field validation.
- Omitting `id` from a motion config.
- Expecting a reduced timeline to run without the corresponding reduced-motion policy.
- Importing package implementation files instead of public package roots.

## Related pages

- [Create and use a custom motion end to end](../tutorials/custom-motion-end-to-end.md)
- [Registered motions](./registered-motions.md)
- [Motion definition reference](../reference/motion-definition.md)
- [Motion registry reference](../reference/motion-registry.md)
- [Motion options](../reference/motion-options.md)
- [Timeline builder](../reference/timeline-builder.md)
