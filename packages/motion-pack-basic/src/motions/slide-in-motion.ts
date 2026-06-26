import {
  BaseMotionDefinition,
  normalizeBoolean,
  normalizeNumber,
  type MotionBuildContext,
  type MotionCategory,
  type MotionOptionDefinition,
  type MotionTimelineDefinition,
  type MotionKeyframe,
  createMotionTimeline
} from '@structifyx/motion-core';

export type SlideInDirection = 'left' | 'right' | 'top' | 'bottom';

export type SlideInMotionOptions = {
  readonly direction: SlideInDirection;
  readonly distance: number;
  readonly fade: boolean;
};

const SLIDE_IN_DIRECTIONS: ReadonlyArray<SlideInDirection> = ['left', 'right', 'top', 'bottom'];

function normalizeDirection(value: unknown): SlideInDirection {
  return SLIDE_IN_DIRECTIONS.includes(value as SlideInDirection)
    ? (value as SlideInDirection)
    : 'bottom';
}

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

export class SlideInMotion extends BaseMotionDefinition<SlideInMotionOptions> {
  readonly type = 'slide-in';
  readonly label = 'Slide in';
  readonly description = 'Makes the target enter with a directional slide.';
  readonly category: MotionCategory = 'entrance';

  readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition> = [
    {
      name: 'direction',
      label: 'Direction',
      description: 'Direction from which the target enters.',
      type: 'select',
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
      ]
    },
    {
      name: 'distance',
      label: 'Distance',
      description: 'Slide distance in pixels.',
      type: 'range',
      defaultValue: 24,
      min: 0,
      max: 300,
      step: 1,
      unit: 'px'
    },
    {
      name: 'fade',
      label: 'Fade',
      description: 'Whether opacity should be animated too.',
      type: 'boolean',
      defaultValue: true
    }
  ];

  getDefaultOptions(): SlideInMotionOptions {
    return {
      direction: 'bottom',
      distance: 24,
      fade: true
    };
  }

  normalizeOptions(options: Record<string, unknown> | undefined): SlideInMotionOptions {
    return {
      direction: normalizeDirection(options?.['direction']),
      distance: normalizeNumber(options?.['distance'], {
        defaultValue: 24,
        min: 0,
        max: 300
      }),
      fade: normalizeBoolean(options?.['fade'], true)
    };
  }

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

  buildReducedMotionTimeline(
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
