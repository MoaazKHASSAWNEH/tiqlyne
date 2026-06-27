import { describe, expect, it } from 'vitest';
import type { MotionBuildContext } from '../contracts/motion-definition';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { createMotionTimeline } from '../builders/create-motion-timeline';
import { SchemaMotionDefinition } from './schema-motion-definition';
import { defineMotionOptions } from '../options/define-motion-options';
import type { InferMotionOptions } from '../options/infer-motion-options';
import { option } from '../options/motion-option-builders';
import { validateDifferent } from '../options/motion-option-validator';

const fadeInOptions = defineMotionOptions({
  fromOpacity: option.number({
    label: 'Start opacity',
    defaultValue: 0,
    min: 0,
    max: 1
  }),
  toOpacity: option.number({
    label: 'End opacity',
    defaultValue: 1,
    min: 0,
    max: 1
  })
});

type FadeInOptions = InferMotionOptions<typeof fadeInOptions.schema>;

class TestFadeInMotion extends SchemaMotionDefinition<typeof fadeInOptions.schema> {
  readonly type = 'test-fade-in';
  readonly label = 'Test Fade In';
  readonly description = 'Fade an element in.';
  readonly category = 'entrance' as const;

  protected readonly options = fadeInOptions;

  protected override readonly validators = [
    validateDifferent('fromOpacity', 'toOpacity', 'fromOpacity and toOpacity must be different.')
  ];

  buildTimeline({ options }: MotionBuildContext<FadeInOptions>): MotionTimelineDefinition {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step((step) => {
          step.from({
            opacity: options.fromOpacity
          });

          step.to({
            opacity: options.toOpacity
          });
        });
      });
    });
  }
}

describe('SchemaMotionDefinition', () => {
  it('exposes option definitions from the schema', () => {
    const motion = new TestFadeInMotion();

    expect(motion.optionDefinitions).toEqual([
      {
        name: 'fromOpacity',
        label: 'Start opacity',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 1
      },
      {
        name: 'toOpacity',
        label: 'End opacity',
        type: 'number',
        defaultValue: 1,
        min: 0,
        max: 1
      }
    ]);
  });

  it('returns default options from the schema', () => {
    const motion = new TestFadeInMotion();

    expect(motion.getDefaultOptions()).toEqual({
      fromOpacity: 0,
      toOpacity: 1
    });
  });

  it('normalizes options from raw input', () => {
    const motion = new TestFadeInMotion();

    expect(
      motion.normalizeOptions({
        fromOpacity: -1,
        toOpacity: 2
      })
    ).toEqual({
      fromOpacity: 0,
      toOpacity: 1
    });
  });

  it('runs validators', () => {
    const motion = new TestFadeInMotion();

    expect(
      motion.validateOptions({
        fromOpacity: 1,
        toOpacity: 1
      })
    ).toEqual(['fromOpacity and toOpacity must be different.']);
  });

  it('builds a normal timeline without changing createMotionTimeline behavior', () => {
    const motion = new TestFadeInMotion();

    const timeline = motion.buildTimeline({
      options: {
        fromOpacity: 0,
        toOpacity: 1
      },
      duration: 300,
      delay: 0,
      easing: 'ease',
      trigger: 'onEnter'
    });

    expect(timeline).toEqual({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              keyframes: [
                {
                  opacity: 0,
                  offset: 0
                },
                {
                  opacity: 1,
                  offset: 1
                }
              ]
            }
          ]
        }
      ]
    });
  });
});
