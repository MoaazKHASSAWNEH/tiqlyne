import {
  SchemaMotionDefinition,
  createMotionTimeline,
  defineMotionOptions,
  option,
  validateDifferent,
  type InferMotionOptions,
  type MotionBuildContext,
  type MotionCategory,
  type MotionTimelineDefinition
} from '@structifyx/motion-core';

const fadeInMotionOptions = defineMotionOptions({
  fromOpacity: option.range({
    label: 'From opacity',
    description: 'Initial opacity value.',
    defaultValue: 0,
    min: 0,
    max: 1,
    step: 0.05,
    unit: 'none'
  }),
  toOpacity: option.range({
    label: 'To opacity',
    description: 'Final opacity value.',
    defaultValue: 1,
    min: 0,
    max: 1,
    step: 0.05,
    unit: 'none'
  })
});

export type FadeInMotionOptions = InferMotionOptions<typeof fadeInMotionOptions.schema>;

export class FadeInMotion extends SchemaMotionDefinition<typeof fadeInMotionOptions.schema> {
  readonly type = 'fade-in';
  readonly label = 'Fade in';
  readonly description = 'Makes the target appear progressively using opacity.';
  readonly category: MotionCategory = 'entrance';

  protected readonly options = fadeInMotionOptions;

  protected override readonly validators = [
    validateDifferent('fromOpacity', 'toOpacity', 'fromOpacity and toOpacity must be different')
  ];

  buildTimeline(context: MotionBuildContext<FadeInMotionOptions>): MotionTimelineDefinition {
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
              opacity: context.options.fromOpacity
            });

            step.to({
              opacity: context.options.toOpacity
            });
          }
        );
      });
    });
  }
}
