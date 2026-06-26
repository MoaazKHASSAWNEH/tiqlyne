import { describe, expect, it } from 'vitest';
import { createMotionTimeline } from '../builders/create-motion-timeline';
import { TestMotionDriver } from '../drivers/test-motion-driver';
import { BaseMotionDefinition } from '../base/base-motion-definition';
import type { MotionBuildContext } from '../contracts/motion-definition';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { DefaultMotionRegistry } from '../registry/default-motion-registry';
import { createMotionEngine } from './create-motion-engine';
import type { MotionCategory } from '../models/motion-category';
import type { MotionOptionDefinition } from '../models/motion-option-definition';

type FadeOptions = {
  readonly opacity: number;
};

class TestFadeMotion extends BaseMotionDefinition<FadeOptions> {
  readonly type: string = 'test-fade';
  readonly label: string = 'Test fade';
  readonly description: string = 'Test fade motion.';
  readonly category: MotionCategory = 'custom';
  readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition> = [];

  getDefaultOptions(): FadeOptions {
    return {
      opacity: 1
    };
  }

  normalizeOptions(options: Record<string, unknown> | undefined): FadeOptions {
    return {
      opacity: typeof options?.['opacity'] === 'number' ? options['opacity'] : 1
    };
  }

  buildTimeline(context: MotionBuildContext<FadeOptions>): MotionTimelineDefinition {
    return {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: context.duration,
              easing: context.easing,
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: context.options.opacity
                }
              ]
            }
          ]
        }
      ]
    };
  }
}

class TestFadeOutMotion extends TestFadeMotion {
  override readonly type = 'test-fade-out';
  override readonly label = 'Test fade out';

  override buildTimeline(context: MotionBuildContext<FadeOptions>): MotionTimelineDefinition {
    return {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: context.duration,
              easing: context.easing,
              keyframes: [
                {
                  opacity: context.options.opacity
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
  }
}

describe('createMotionEngine', () => {
  it('creates an engine with default registry and normalizer', async () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver
    });

    const timeline = createMotionTimeline((timelineBuilder) => {
      timelineBuilder.track('self', (track) => {
        track.step({ duration: 300 }, (step) => {
          step.from({ opacity: 0 });
          step.to({ opacity: 1 });
        });
      });
    });

    const result = await motion.playTimeline('target', timeline);

    expect(result.status).toBe('finished');
    expect(driver.getCalls()).toHaveLength(1);
  });

  it('uses a provided registry for registered motion playback', async () => {
    const driver = new TestMotionDriver<string>();
    const registry = new DefaultMotionRegistry();

    registry.register(new TestFadeMotion());

    const motion = createMotionEngine({
      driver,
      registry
    });

    const result = await motion.play('target', {
      id: 'motion_001',
      type: 'test-fade',
      options: {
        opacity: 0.5
      }
    });

    expect(result.status).toBe('finished');
    expect(driver.getCalls()).toHaveLength(1);
  });

  it('skips unknown registered motions when using the default registry', async () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver
    });

    const result = await motion.play('target', {
      id: 'motion_001',
      type: 'unknown-motion'
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'unknown-motion-type'
    });

    expect(driver.getCalls()).toHaveLength(0);
  });

  it('applies engine defaults to direct timelines', () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver,
      defaults: {
        duration: 450,
        easing: 'ease-out',
        fill: 'both'
      }
    });

    const timeline = createMotionTimeline((timelineBuilder) => {
      timelineBuilder.track('self', (track) => {
        track.step((step) => {
          step.from({ opacity: 0 });
          step.to({ opacity: 1 });
        });
      });
    });

    const plan = motion.planTimeline(timeline);

    expect(plan.timeline.tracks[0]?.steps[0]).toEqual(
      expect.objectContaining({
        duration: 450,
        easing: 'ease-out',
        fill: 'both'
      })
    );
  });

  it('keeps timeline defaults above engine defaults', () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver,
      defaults: {
        duration: 450,
        easing: 'ease-out'
      }
    });

    const timeline = createMotionTimeline((timelineBuilder) => {
      timelineBuilder.defaults({
        duration: 120
      });

      timelineBuilder.track('self', (track) => {
        track.step((step) => {
          step.from({ opacity: 0 });
          step.to({ opacity: 1 });
        });
      });
    });

    const plan = motion.planTimeline(timeline);

    expect(plan.timeline.tracks[0]?.steps[0]).toEqual(
      expect.objectContaining({
        duration: 120,
        easing: 'ease-out'
      })
    );
  });

  it('keeps step values above engine defaults', () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver,
      defaults: {
        duration: 450
      }
    });

    const timeline = createMotionTimeline((timelineBuilder) => {
      timelineBuilder.track('self', (track) => {
        track.step({ duration: 90 }, (step) => {
          step.from({ opacity: 0 });
          step.to({ opacity: 1 });
        });
      });
    });

    const plan = motion.planTimeline(timeline);

    expect(plan.timeline.tracks[0]?.steps[0]).toEqual(
      expect.objectContaining({
        duration: 90
      })
    );
  });

  it('uses engine validation options for direct timelines', () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver,
      validation: {
        performanceDiagnostics: {
          filter: 'error'
        }
      }
    });

    const timeline = createMotionTimeline((timelineBuilder) => {
      timelineBuilder.track('self', (track) => {
        track.step({ duration: 300 }, (step) => {
          step.from({
            filter: {
              blur: 8
            }
          });

          step.to({
            filter: {
              blur: 0
            }
          });
        });
      });
    });

    expect(() => motion.planTimeline(timeline)).toThrow();
  });

  it('lets direct play validation options override engine validation options', () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver,
      validation: {
        performanceDiagnostics: {
          filter: 'error'
        }
      }
    });

    const timeline = createMotionTimeline((timelineBuilder) => {
      timelineBuilder.track('self', (track) => {
        track.step({ duration: 300 }, (step) => {
          step.from({
            filter: {
              blur: 8
            }
          });

          step.to({
            filter: {
              blur: 0
            }
          });
        });
      });
    });

    expect(() =>
      motion.planTimeline(timeline, {
        validation: {
          performanceDiagnostics: {
            filter: 'warning'
          }
        }
      })
    ).not.toThrow();
  });

  it('registers a motion definition through the engine facade', async () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver
    });

    motion.register(new TestFadeMotion());

    expect(motion.has('test-fade')).toBe(true);
    expect(motion.get('test-fade')?.type).toBe('test-fade');

    const result = await motion.play('target', {
      id: 'motion_001',
      type: 'test-fade'
    });

    expect(result.status).toBe('finished');
    expect(driver.getCalls()).toHaveLength(1);
  });

  it('returns the engine from register for chaining', () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver
    });

    const returned = motion.register(new TestFadeMotion());

    expect(returned).toBe(motion);
  });

  it('registers many motion definitions through the engine facade', () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver
    });

    motion.registerMany([new TestFadeMotion(), new TestFadeOutMotion()]);

    expect(motion.has('test-fade')).toBe(true);
    expect(motion.has('test-fade-out')).toBe(true);
    expect(motion.getAll().map((definition) => definition.type)).toEqual([
      'test-fade',
      'test-fade-out'
    ]);
  });

  it('gets registered motions by category through the engine facade', () => {
    const driver = new TestMotionDriver<string>();
    const motion = createMotionEngine({
      driver
    });

    motion.register(new TestFadeMotion());

    expect(motion.getByCategory('custom').map((definition) => definition.type)).toEqual([
      'test-fade'
    ]);
  });
});
