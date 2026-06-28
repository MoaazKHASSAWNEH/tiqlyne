import { describe, expect, it } from 'vitest';
import { BaseMotionDefinition } from '../base/base-motion-definition';
import type { MotionBuildContext } from '../contracts/motion-definition';
import { DefaultMotionRegistry } from '../registry/default-motion-registry';
import { MotionPlanningError } from '../engine/motion-planning-error';
import type { MotionCategory } from '../models/motion-category';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { compileMotionComposition } from './compile-motion-composition';
import type { MotionCompositionDefinition } from './motion-composition-definition';

type TestMotionOptions = {
  readonly opacity: number;
};

class TestFadeMotion extends BaseMotionDefinition<TestMotionOptions> {
  readonly type = 'test-fade';
  readonly label = 'Test fade';
  readonly description = 'Test fade motion.';
  readonly category: MotionCategory = 'entrance';

  readonly optionDefinitions = [];

  getDefaultOptions(): TestMotionOptions {
    return {
      opacity: 1
    };
  }

  normalizeOptions(options: Record<string, unknown> | undefined): TestMotionOptions {
    return {
      opacity: typeof options?.opacity === 'number' ? options.opacity : 1
    };
  }

  override validateOptions(options: TestMotionOptions): ReadonlyArray<string> {
    return options.opacity >= 0 && options.opacity <= 1 ? [] : ['Opacity must be between 0 and 1'];
  }

  buildTimeline(context: MotionBuildContext<TestMotionOptions>): MotionTimelineDefinition {
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
                  opacity: 0,
                  offset: 0
                },
                {
                  opacity: context.options.opacity,
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

function createRegistry(): DefaultMotionRegistry {
  const registry = new DefaultMotionRegistry();

  registry.register(new TestFadeMotion());

  return registry;
}

describe('compileMotionComposition', () => {
  it('throws when the composition is empty', () => {
    expect(() =>
      compileMotionComposition(
        {
          items: []
        },
        {
          registry: createRegistry()
        }
      )
    ).toThrow(MotionPlanningError);
  });

  it('compiles one registered motion item', () => {
    const timeline = compileMotionComposition(
      {
        items: [
          {
            kind: 'motion',
            type: 'test-fade',
            options: {
              opacity: 0.75
            }
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline).toEqual({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              delay: 0,
              easing: 'ease-out',
              fill: 'both',
              keyframes: [
                {
                  opacity: 0,
                  offset: 0
                },
                {
                  opacity: 0.75,
                  offset: 1
                }
              ]
            }
          ]
        }
      ]
    });
  });

  it('uses composition defaults when building a registered motion item', () => {
    const timeline = compileMotionComposition(
      {
        defaults: {
          duration: 500,
          delay: 25,
          easing: 'linear',
          fill: 'both'
        },
        items: [
          {
            kind: 'motion',
            type: 'test-fade'
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.defaults).toEqual({
      duration: 500,
      delay: 25,
      easing: 'linear',
      fill: 'both'
    });

    expect(timeline.tracks[0]?.steps[0]).toMatchObject({
      duration: 500,
      delay: 25,
      easing: 'linear'
    });
  });

  it('lets item defaults override composition defaults for the item build context', () => {
    const timeline = compileMotionComposition(
      {
        defaults: {
          duration: 500,
          delay: 25,
          easing: 'linear'
        },
        items: [
          {
            kind: 'motion',
            type: 'test-fade',
            defaults: {
              duration: 150,
              easing: 'ease-in'
            }
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.defaults).toEqual({
      duration: 500,
      delay: 25,
      easing: 'linear'
    });

    expect(timeline.tracks[0]?.steps[0]).toMatchObject({
      duration: 150,
      delay: 25,
      easing: 'ease-in'
    });
  });

  it('applies target override to compiled registered motion tracks', () => {
    const timeline = compileMotionComposition(
      {
        items: [
          {
            kind: 'motion',
            type: 'test-fade',
            target: {
              type: 'selector',
              selector: '.card'
            }
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.tracks[0]?.target).toEqual({
      type: 'selector',
      selector: '.card'
    });
  });

  it('applies at placement to the first step of every compiled track', () => {
    const timeline = compileMotionComposition(
      {
        items: [
          {
            kind: 'motion',
            type: 'test-fade',
            at: 100
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.tracks[0]?.steps[0]?.at).toBe(100);
  });

  it('throws for an unknown registered motion type', () => {
    expect(() =>
      compileMotionComposition(
        {
          items: [
            {
              kind: 'motion',
              type: 'missing-motion'
            }
          ]
        },
        {
          registry: createRegistry()
        }
      )
    ).toThrow(MotionPlanningError);
  });

  it('throws when registered motion options are invalid', () => {
    expect(() =>
      compileMotionComposition(
        {
          items: [
            {
              kind: 'motion',
              type: 'test-fade',
              options: {
                opacity: 2
              }
            }
          ]
        },
        {
          registry: createRegistry()
        }
      )
    ).toThrow(MotionPlanningError);
  });

  it('compiles a direct timeline item', () => {
    const directTimeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 200,
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
    };

    const timeline = compileMotionComposition(
      {
        items: [
          {
            kind: 'timeline',
            timeline: directTimeline,
            target: {
              type: 'selector',
              selector: '.hero'
            },
            at: 100
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.tracks[0]?.target).toEqual({
      type: 'selector',
      selector: '.hero'
    });

    expect(timeline.tracks[0]?.steps[0]?.at).toBe(100);
  });

  it('throws when the compiled timeline is invalid', () => {
    const invalidTimeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: -1,
              keyframes: [
                {
                  opacity: 1,
                  offset: 1
                }
              ]
            }
          ]
        }
      ]
    };

    expect(() =>
      compileMotionComposition(
        {
          items: [
            {
              kind: 'timeline',
              timeline: invalidTimeline
            }
          ]
        },
        {
          registry: createRegistry()
        }
      )
    ).toThrow(MotionPlanningError);
  });

  it('preserves composition labels', () => {
    const timeline = compileMotionComposition(
      {
        labels: {
          start: 0,
          visible: 300
        },
        items: [
          {
            kind: 'motion',
            type: 'test-fade',
            at: 'start'
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.labels).toEqual({
      start: 0,
      visible: 300
    });

    expect(timeline.tracks[0]?.steps[0]?.at).toBe('start');
  });
});
