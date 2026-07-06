import {
  SchemaMotionDefinition,
  createMotionTimeline,
  defineMotionOptions,
  option,
  validateDecreasing,
  type InferMotionOptions,
  type MotionBuildContext,
  type MotionCategory,
  type MotionTimelineDefinition
} from '@tiqlyne/motion-core';

const fadeOutMotionOptions = defineMotionOptions({
  fromOpacity: option.range({
    label: 'From opacity',
    description: 'Initial opacity value.',
    defaultValue: 1,
    min: 0,
    max: 1,
    step: 0.05,
    unit: 'none'
  }),
  toOpacity: option.range({
    label: 'To opacity',
    description: 'Final opacity value.',
    defaultValue: 0,
    min: 0,
    max: 1,
    step: 0.05,
    unit: 'none'
  })
});

export type FadeOutMotionOptions = InferMotionOptions<typeof fadeOutMotionOptions.schema>;

export class FadeOutMotion extends SchemaMotionDefinition<typeof fadeOutMotionOptions.schema> {
  readonly type = 'fade-out';
  readonly label = 'Fade out';
  readonly description = 'Makes the target disappear progressively using opacity.';
  readonly category: MotionCategory = 'exit';

  protected readonly options = fadeOutMotionOptions;

  protected override readonly optionValidators = [
    validateDecreasing('fromOpacity', 'toOpacity', 'Fade out opacity must decrease')
  ];

  buildTimeline(context: MotionBuildContext<FadeOutMotionOptions>): MotionTimelineDefinition {
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
