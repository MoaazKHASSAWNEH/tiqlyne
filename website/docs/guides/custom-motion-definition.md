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
  validateIncreasing,
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

type Options = InferMotionOptions<typeof options.schema>;

export class RiseInMotion extends SchemaMotionDefinition<typeof options.schema> {
  readonly type = 'rise-in';
  readonly label = 'Rise in';
  readonly description = 'Makes the target rise into place.';
  readonly category: MotionCategory = 'entrance';

  protected readonly options = options;

  protected override readonly optionValidators = [
    validateIncreasing('fromOpacity', 'toOpacity', 'Rise opacity must increase')
  ];

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
              opacity: context.options.fromOpacity,
              transform: {
                y: context.options.distance
              }
            });

            step.to({
              opacity: context.options.toOpacity,
              transform: {
                y: 0
              }
            });
          }
        );
      });
    });
  }

  override buildReducedMotionTimeline(context: MotionBuildContext<Options>) {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step({ duration: Math.min(context.duration, 150), fill: 'both' }, (step) => {
          step.from({ opacity: context.options.fromOpacity });
          step.to({ opacity: context.options.toOpacity });
        });
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

The schema clamps numeric values and supplies defaults before `optionValidators` runs. Validation messages cause planning reason `invalid-motion-options`. The reduced timeline removes spatial movement and caps duration at 150 ms.

## Best practices

A custom motion definition should:

- keep its `type` stable;
- define clear options;
- validate options when needed;
- return a core timeline;
- avoid DOM APIs;
- avoid framework-specific APIs;
- provide a reduced motion timeline when the animation contains large movement.

## Common mistakes

- Accessing DOM or WAAPI objects from the definition.
- Returning a timeline with unresolved/invalid labels or empty keyframes.
- Treating option metadata such as `step` as a validator.
- Forgetting that reduced timelines are built only for the `simplify` strategy.

## Related pages

- [Motion definition reference](../reference/motion-definition.md)
- [Motion options](../reference/motion-options.md)
- [Timeline builder](../reference/timeline-builder.md)
