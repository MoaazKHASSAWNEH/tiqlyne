---
sidebar_position: 11
---

# Create a custom motion definition

## Goal

Create a reusable `rise-in` definition with normalized distance options.

```ts
import {
  SchemaMotionDefinition,
  createMotionTimeline,
  defineMotionOptions,
  option,
  type InferMotionOptions,
  type MotionBuildContext
} from '@tiqlyne/motion-core';

const riseOptions = defineMotionOptions({
  distance: option.range({
    label: 'Distance',
    defaultValue: 24,
    min: 0,
    max: 200,
    step: 1,
    unit: 'px'
  })
});

type RiseOptions = InferMotionOptions<typeof riseOptions.schema>;

class RiseInMotion extends SchemaMotionDefinition<typeof riseOptions.schema> {
  readonly type = 'rise-in';
  readonly label = 'Rise in';
  readonly description = 'Moves content upward into place.';
  readonly category = 'entrance' as const;
  protected readonly options = riseOptions;

  buildTimeline(context: MotionBuildContext<RiseOptions>) {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step({ duration: context.duration, fill: 'both' }, (step) => {
          step.from({ opacity: 0, transform: { y: context.options.distance } });
          step.to({ opacity: 1, transform: { y: 0 } });
        });
      });
    });
  }
}

motion.register(new RiseInMotion());
await motion.play(element, { id: 'hero-rise', type: 'rise-in', options: { distance: 32 } });
```

## What you learned

Definitions normalize options and produce symbolic core timelines. They must not access the DOM.

## Next steps

See the [complete definition guide](../guides/custom-motion-definition.md) for validation and reduced timelines, or create a [custom driver](./custom-driver.md).
