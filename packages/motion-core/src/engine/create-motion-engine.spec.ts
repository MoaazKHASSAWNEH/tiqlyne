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
  readonly type = 'test-fade';
  readonly label = 'Test fade';
  readonly description = 'Test fade motion.';
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
});
