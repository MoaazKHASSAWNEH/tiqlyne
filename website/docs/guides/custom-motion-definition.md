---
sidebar_position: 11
---

# Custom motion definition

Custom motion definitions let you create reusable animations that can be registered and played by type.

Use a custom definition when an animation should become part of a shared motion vocabulary.

## Definition shape

A definition usually contains:

- a stable `type`;
- a label;
- a description;
- a category;
- typed options;
- a `buildTimeline` method.

## Example

```ts
import {
  SchemaMotionDefinition,
  createMotionTimeline,
  defineMotionOptions,
  option,
  type InferMotionOptions,
  type MotionBuildContext,
  type MotionCategory,
  type MotionTimelineDefinition
} from '@tiqlyne/motion-core';

const options = defineMotionOptions({
  distance: option.range({
    label: 'Distance',
    description: 'Movement distance in pixels.',
    defaultValue: 24,
    min: 0,
    max: 300,
    step: 1,
    unit: 'px'
  })
});

type Options = InferMotionOptions<typeof options.schema>;

export class RiseInMotion extends SchemaMotionDefinition<typeof options.schema> {
  readonly type = 'rise-in';
  readonly label = 'Rise in';
  readonly description = 'Makes the target rise into place.';
  readonly category: MotionCategory = 'entrance';

  protected readonly options = options;

  buildTimeline(context: MotionBuildContext<Options>): MotionTimelineDefinition {
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
              opacity: 0,
              transform: {
                y: context.options.distance
              }
            });

            step.to({
              opacity: 1,
              transform: {
                y: 0
              }
            });
          }
        );
      });
    });
  }
}
```

## Register the definition

```ts
registry.register(new RiseInMotion());
```

## Play it

```ts
await motion.play(element, {
  type: 'rise-in',
  trigger: 'manual',
  options: {
    distance: 32
  }
});
```

## Best practices

A custom motion definition should:

- keep its `type` stable;
- define clear options;
- validate options when needed;
- return a core timeline;
- avoid DOM APIs;
- avoid framework-specific APIs;
- provide a reduced motion timeline when the animation contains large movement.
