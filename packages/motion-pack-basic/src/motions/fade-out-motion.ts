import {
  BaseMotionDefinition,
  normalizeNumber,
  type MotionBuildContext,
  type MotionCategory,
  type MotionOptionDefinition,
  type MotionTimelineDefinition
} from '@structifyx/motion-core';

export type FadeOutMotionOptions = {
  readonly fromOpacity: number;
  readonly toOpacity: number;
};

export class FadeOutMotion extends BaseMotionDefinition<FadeOutMotionOptions> {
  readonly type = 'fade-out';
  readonly label = 'Fade out';
  readonly description = 'Makes the target disappear progressively using opacity.';
  readonly category: MotionCategory = 'exit';

  readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition> = [
    {
      name: 'fromOpacity',
      label: 'From opacity',
      description: 'Initial opacity value.',
      type: 'range',
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 0.05,
      unit: 'none'
    },
    {
      name: 'toOpacity',
      label: 'To opacity',
      description: 'Final opacity value.',
      type: 'range',
      defaultValue: 0,
      min: 0,
      max: 1,
      step: 0.05,
      unit: 'none'
    }
  ];

  getDefaultOptions(): FadeOutMotionOptions {
    return {
      fromOpacity: 1,
      toOpacity: 0
    };
  }

  normalizeOptions(
    options: Record<string, unknown> | undefined
  ): FadeOutMotionOptions {
    return {
      fromOpacity: normalizeNumber(options?.['fromOpacity'], {
        defaultValue: 1,
        min: 0,
        max: 1
      }),
      toOpacity: normalizeNumber(options?.['toOpacity'], {
        defaultValue: 0,
        min: 0,
        max: 1
      })
    };
  }

  override validateOptions(options: FadeOutMotionOptions): ReadonlyArray<string> {
    if (options.fromOpacity === options.toOpacity) {
      return ['fromOpacity and toOpacity must be different'];
    }

    return [];
  }

  buildTimeline(
    context: MotionBuildContext<FadeOutMotionOptions>
  ): MotionTimelineDefinition {
    return {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: context.duration,
              delay: context.delay,
              easing: context.easing,
              fill: 'both',
              keyframes: [
                {
                  opacity: context.options.fromOpacity,
                  offset: 0
                },
                {
                  opacity: context.options.toOpacity,
                  offset: 1
                }
              ]
            }
          ]
        }
      ]
    };
  }
}