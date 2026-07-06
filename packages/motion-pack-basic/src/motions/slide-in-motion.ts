import {
  SchemaMotionDefinition,
  createMotionTimeline,
  defineMotionOptions,
  option,
  type InferMotionOptions,
  type MotionBuildContext,
  type MotionCategory,
  type MotionKeyframe,
  type MotionTimelineDefinition
} from '@tiqlyne/motion-core';

export type SlideInDirection = 'left' | 'right' | 'top' | 'bottom';

const slideInMotionOptions = defineMotionOptions({
  direction: option.select({
    label: 'Direction',
    description: 'Direction from which the target enters.',
    defaultValue: 'bottom',
    choices: [
      {
        label: 'Left',
        value: 'left'
      },
      {
        label: 'Right',
        value: 'right'
      },
      {
        label: 'Top',
        value: 'top'
      },
      {
        label: 'Bottom',
        value: 'bottom'
      }
    ] as const
  }),
  distance: option.range({
    label: 'Distance',
    description: 'Slide distance in pixels.',
    defaultValue: 24,
    min: 0,
    max: 300,
    step: 1,
    unit: 'px'
  }),
  fade: option.boolean({
    label: 'Fade',
    description: 'Whether opacity should be animated too.',
    defaultValue: true
  })
});

export type SlideInMotionOptions = InferMotionOptions<typeof slideInMotionOptions.schema>;

function buildInitialTransform(direction: SlideInDirection, distance: number): string {
  switch (direction) {
    case 'left':
      return `translateX(-${distance}px)`;
    case 'right':
      return `translateX(${distance}px)`;
    case 'top':
      return `translateY(-${distance}px)`;
    case 'bottom':
      return `translateY(${distance}px)`;
  }
}

export class SlideInMotion extends SchemaMotionDefinition<typeof slideInMotionOptions.schema> {
  readonly type = 'slide-in';
  readonly label = 'Slide in';
  readonly description = 'Makes the target enter with a directional slide.';
  readonly category: MotionCategory = 'entrance';

  protected readonly options = slideInMotionOptions;

  buildTimeline(context: MotionBuildContext<SlideInMotionOptions>): MotionTimelineDefinition {
    const initialKeyframe: MotionKeyframe = context.options.fade
      ? {
          transform: buildInitialTransform(context.options.direction, context.options.distance),
          opacity: 0
        }
      : {
          transform: buildInitialTransform(context.options.direction, context.options.distance)
        };

    const finalKeyframe: MotionKeyframe = context.options.fade
      ? {
          transform: 'translate3d(0, 0, 0)',
          opacity: 1
        }
      : {
          transform: 'translate3d(0, 0, 0)'
        };

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
            step.from(initialKeyframe);
            step.to(finalKeyframe);
          }
        );
      });
    });
  }

  override buildReducedMotionTimeline(
    context: MotionBuildContext<SlideInMotionOptions>
  ): MotionTimelineDefinition {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step(
          {
            duration: Math.min(context.duration, 150),
            delay: 0,
            easing: 'ease-out',
            fill: 'both'
          },
          (step) => {
            step.from({
              opacity: 0
            });

            step.to({
              opacity: 1
            });
          }
        );
      });
    });
  }
}
