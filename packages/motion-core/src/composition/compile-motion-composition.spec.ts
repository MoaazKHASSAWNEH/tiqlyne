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

  it('applies at placement as a block offset for compiled tracks', () => {
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

  it('shifts direct timeline step positions as a block with numeric placement', () => {
    const directTimeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 0,
              duration: 100,
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1
                }
              ]
            },
            {
              at: 300,
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                },
                {
                  opacity: 0.5
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
            at: 1000
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.tracks[0]?.steps[0]?.at).toBe(1000);
    expect(timeline.tracks[0]?.steps[1]?.at).toBe(1300);
  });

  it('shifts numeric step positions from a label placement', () => {
    const directTimeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 0,
              duration: 100,
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1
                }
              ]
            },
            {
              at: 300,
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                },
                {
                  opacity: 0.5
                }
              ]
            }
          ]
        }
      ]
    };

    const timeline = compileMotionComposition(
      {
        labels: {
          intro: 500
        },
        items: [
          {
            kind: 'timeline',
            timeline: directTimeline,
            at: 'intro'
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.tracks[0]?.steps[0]?.at).toEqual({
      label: 'intro',
      offset: 0
    });
    expect(timeline.tracks[0]?.steps[1]?.at).toEqual({
      label: 'intro',
      offset: 300
    });
  });

  it('shifts numeric step positions from a label placement with offset', () => {
    const directTimeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 0,
              duration: 100,
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1
                }
              ]
            },
            {
              at: 300,
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                },
                {
                  opacity: 0.5
                }
              ]
            }
          ]
        }
      ]
    };

    const timeline = compileMotionComposition(
      {
        labels: {
          intro: 500
        },
        items: [
          {
            kind: 'timeline',
            timeline: directTimeline,
            at: {
              label: 'intro',
              offset: 100
            }
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.tracks[0]?.steps[0]?.at).toEqual({
      label: 'intro',
      offset: 100
    });
    expect(timeline.tracks[0]?.steps[1]?.at).toEqual({
      label: 'intro',
      offset: 400
    });
  });

  it('shifts every track in a direct timeline item as a block', () => {
    const directTimeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 0,
              duration: 100,
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1
                }
              ]
            }
          ]
        },
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 200,
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                },
                {
                  opacity: 0
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
            at: 1000
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.tracks[0]?.steps[0]?.at).toBe(1000);
    expect(timeline.tracks[1]?.steps[0]?.at).toBe(1200);
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

  it('adds a label for a registered motion composition item', () => {
    const timeline = compileMotionComposition(
      {
        items: [
          {
            kind: 'motion',
            type: 'test-fade',
            label: 'card-enter',
            at: 300
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.labels).toEqual({
      'card-enter': 300
    });
  });

  it('adds a label for a direct timeline composition item', () => {
    const directTimeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 100,
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1
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
            label: 'direct-enter',
            at: 250
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.labels).toEqual({
      'direct-enter': 250
    });
  });

  it('resolves item labels from existing composition labels', () => {
    const timeline = compileMotionComposition(
      {
        labels: {
          intro: 500
        },
        items: [
          {
            kind: 'motion',
            type: 'test-fade',
            label: 'card-enter',
            at: {
              label: 'intro',
              offset: 150
            }
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.labels).toEqual({
      intro: 500,
      'card-enter': 650
    });
  });

  it('allows later items to use previous item labels', () => {
    const timeline = compileMotionComposition(
      {
        items: [
          {
            kind: 'motion',
            type: 'test-fade',
            label: 'card-enter',
            at: 300
          },
          {
            kind: 'motion',
            type: 'test-fade',
            at: {
              label: 'card-enter',
              offset: 150
            }
          }
        ]
      },
      {
        registry: createRegistry()
      }
    );

    expect(timeline.labels).toEqual({
      'card-enter': 300
    });

    expect(timeline.tracks[1]?.steps[0]?.at).toEqual({
      label: 'card-enter',
      offset: 150
    });
  });

  it('throws when an item label duplicates a composition label', () => {
    expect(() =>
      compileMotionComposition(
        {
          labels: {
            intro: 100
          },
          items: [
            {
              kind: 'motion',
              type: 'test-fade',
              label: 'intro',
              at: 300
            }
          ]
        },
        {
          registry: createRegistry()
        }
      )
    ).toThrow(MotionPlanningError);
  });

  it('throws when an item label references a missing label', () => {
    expect(() =>
      compileMotionComposition(
        {
          items: [
            {
              kind: 'motion',
              type: 'test-fade',
              label: 'card-enter',
              at: 'missing-label'
            }
          ]
        },
        {
          registry: createRegistry()
        }
      )
    ).toThrow(MotionPlanningError);
  });

  it('throws when an item label uses an anchor placement', () => {
    expect(() =>
      compileMotionComposition(
        {
          items: [
            {
              kind: 'motion',
              type: 'test-fade',
              label: 'card-enter',
              at: {
                anchor: 'track-start'
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
});
