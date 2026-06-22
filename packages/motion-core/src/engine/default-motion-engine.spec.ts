import { describe, expect, it } from 'vitest';
import type { MotionBuildContext, MotionDefinition } from '../contracts/motion-definition';
import { TestMotionDriver } from '../drivers/test-motion-driver';
import type { MotionCategory } from '../models/motion-category';
import type { MotionOptionDefinition } from '../models/motion-option-definition';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { DefaultMotionConfigNormalizer } from '../normalizer/default-motion-config-normalizer';
import { DefaultMotionRegistry } from '../registry/default-motion-registry';
import { DefaultMotionEngine } from './default-motion-engine';
import type { MotionDriver, MotionPlayOptions } from '../contracts/motion-driver';
import type { MotionPlaybackController } from '../models/motion-playback-controller';
import type { MotionPlaybackResult } from '../models/motion-playback-result';

type TestOptions = {
  readonly intensity: number;
};

class TestMotionDefinition implements MotionDefinition<TestOptions> {
  readonly type: string = 'test-motion';
  readonly label = 'Test motion';
  readonly description = 'A test motion definition.';
  readonly category: MotionCategory = 'custom';
  readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition> = [];

  getDefaultOptions(): TestOptions {
    return {
      intensity: 1
    };
  }

  normalizeOptions(options: Record<string, unknown> | undefined): TestOptions {
    const intensity = typeof options?.['intensity'] === 'number' ? options['intensity'] : 1;

    return {
      intensity
    };
  }

  validateOptions(options: TestOptions): ReadonlyArray<string> {
    if (options.intensity < 0) {
      return ['intensity must be greater than or equal to 0'];
    }

    return [];
  }

  buildTimeline(context: MotionBuildContext<TestOptions>): MotionTimelineDefinition {
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
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: context.options.intensity
                }
              ]
            }
          ]
        }
      ]
    };
  }
}

class ThrowingMotionDefinition extends TestMotionDefinition {
  override readonly type = 'throwing-motion';

  override buildTimeline(): MotionTimelineDefinition {
    throw new Error('Timeline build failed');
  }
}

class InvalidTimelineMotionDefinition extends TestMotionDefinition {
  override readonly type = 'invalid-timeline-motion';

  override buildTimeline(): MotionTimelineDefinition {
    return {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: -1,
              keyframes: []
            }
          ]
        }
      ]
    };
  }
}

class ReducedMotionAwareMotionDefinition extends TestMotionDefinition {
  override readonly type = 'reduced-aware-motion';

  buildReducedMotionTimeline(context: MotionBuildContext<TestOptions>): MotionTimelineDefinition {
    return {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: Math.min(context.duration, 120),
              delay: 0,
              easing: 'ease-out',
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
  }
}

class InvalidReducedMotionTimelineDefinition extends TestMotionDefinition {
  override readonly type = 'invalid-reduced-motion-timeline';

  buildReducedMotionTimeline(): MotionTimelineDefinition {
    return {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: -1,
              keyframes: []
            }
          ]
        }
      ]
    };
  }
}

function createEngine() {
  const registry = new DefaultMotionRegistry();
  const driver = new TestMotionDriver<string>();
  const normalizer = new DefaultMotionConfigNormalizer();

  const engine = new DefaultMotionEngine<string>({
    registry,
    driver,
    normalizer
  });

  return {
    registry,
    driver,
    engine
  };
}

class NativePlaybackTestDriver implements MotionDriver<string> {
  readonly name = 'native-playback-test';

  readonly playCalls: Array<{
    readonly target: string;
    readonly timeline: MotionTimelineDefinition;
    readonly options: MotionPlayOptions;
  }> = [];

  readonly createPlaybackCalls: Array<{
    readonly target: string;
    readonly timeline: MotionTimelineDefinition;
    readonly options: MotionPlayOptions;
  }> = [];

  readonly controller: MotionPlaybackController = {
    id: 'native-controller',
    status: 'running',
    disposed: false,
    finished: Promise.resolve({
      status: 'finished'
    }),
    on: () => {
      return (): void => {};
    },
    once: () => {
      return (): void => {};
    },
    dispose: (): void => {},
    pause: async (): Promise<MotionPlaybackResult> => ({
      status: 'paused',
      reason: 'native-controller-pause'
    }),
    resume: async (): Promise<MotionPlaybackResult> => ({
      status: 'running',
      reason: 'native-controller-resume'
    }),
    cancel: async (): Promise<MotionPlaybackResult> => ({
      status: 'cancelled',
      reason: 'native-controller-cancel'
    }),
    finish: async (): Promise<MotionPlaybackResult> => ({
      status: 'finished',
      reason: 'native-controller-finish'
    })
  };

  async play(
    target: string,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult> {
    this.playCalls.push({
      target,
      timeline,
      options
    });

    return {
      status: 'finished'
    };
  }

  createPlayback(
    target: string,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): MotionPlaybackController {
    this.createPlaybackCalls.push({
      target,
      timeline,
      options
    });

    return this.controller;
  }
}

describe('DefaultMotionEngine', () => {
  it('skips disabled motion config', async () => {
    const { engine, driver } = createEngine();

    const result = await engine.play('target-1', {
      id: 'motion_001',
      type: 'test-motion',
      trigger: 'onEnter',
      enabled: false
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'motion-disabled'
    });

    expect(driver.getCalls()).toHaveLength(0);
  });

  it('skips unknown motion type', async () => {
    const { engine, driver } = createEngine();

    const result = await engine.play('target-1', {
      id: 'motion_002',
      type: 'unknown-motion',
      trigger: 'onEnter'
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'unknown-motion-type'
    });

    expect(driver.getCalls()).toHaveLength(0);
  });

  it('plays a registered motion definition', async () => {
    const { engine, registry, driver } = createEngine();

    registry.register(new TestMotionDefinition());

    const result = await engine.play('target-1', {
      id: 'motion_003',
      type: 'test-motion',
      trigger: 'onClick',
      duration: 400,
      delay: 50,
      easing: 'ease-out',
      options: {
        intensity: 0.8
      },
      respectReducedMotion: false
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(driver.getCalls()).toHaveLength(1);

    const [call] = driver.getCalls();

    expect(call).toEqual({
      target: 'target-1',
      timeline: {
        tracks: [
          {
            target: {
              type: 'self'
            },
            steps: [
              {
                duration: 400,
                delay: 50,
                easing: 'ease-out',
                keyframes: [
                  {
                    opacity: 0
                  },
                  {
                    opacity: 0.8
                  }
                ]
              }
            ]
          }
        ]
      },
      options: {
        trigger: 'onClick',
        respectReducedMotion: false,
        reducedMotionStrategy: 'skip',
        conflictStrategy: 'replace',
        timelineValidated: true
      }
    });
  });

  it('passes a reduced motion timeline to the driver when strategy is simplify', async () => {
    const { engine, registry, driver } = createEngine();

    registry.register(new ReducedMotionAwareMotionDefinition());

    const result = await engine.play('target-1', {
      id: 'motion_reduced_001',
      type: 'reduced-aware-motion',
      trigger: 'onClick',
      duration: 400,
      reducedMotionStrategy: 'simplify',
      options: {
        intensity: 0.8
      }
    });

    expect(driver.getCalls()[0]?.options.timelineValidated).toBe(true);
    expect(driver.getCalls()[0]?.options.reducedMotionTimelineValidated).toBe(true);

    expect(result).toEqual({
      status: 'finished'
    });

    expect(driver.getCalls()).toHaveLength(1);

    expect(driver.getCalls()[0]?.options.reducedMotionTimeline).toEqual({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 120,
              delay: 0,
              easing: 'ease-out',
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
    });
  });

  it('passes conflict strategy to the driver', async () => {
    const { engine, registry, driver } = createEngine();

    registry.register(new TestMotionDefinition());

    const result = await engine.play('target-1', {
      id: 'motion_conflict_001',
      type: 'test-motion',
      trigger: 'onClick',
      conflictStrategy: 'ignore'
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(driver.getCalls()).toHaveLength(1);
    expect(driver.getCalls()[0]?.options.conflictStrategy).toBe('ignore');
  });

  it('returns failed result when options are invalid', async () => {
    const { engine, registry, driver } = createEngine();

    registry.register(new TestMotionDefinition());

    const result = await engine.play('target-1', {
      id: 'motion_004',
      type: 'test-motion',
      trigger: 'onEnter',
      options: {
        intensity: -1
      }
    });

    expect(result).toEqual({
      status: 'failed',
      reason: 'invalid-motion-options',
      error: ['intensity must be greater than or equal to 0']
    });

    expect(driver.getCalls()).toHaveLength(0);
  });

  it('returns failed result when reduced motion timeline is invalid', async () => {
    const { engine, registry, driver } = createEngine();

    registry.register(new InvalidReducedMotionTimelineDefinition());

    const result = await engine.play('target-1', {
      id: 'motion_invalid_reduced_timeline_001',
      type: 'invalid-reduced-motion-timeline',
      trigger: 'onEnter',
      reducedMotionStrategy: 'simplify'
    });

    expect(result).toMatchObject({
      status: 'failed',
      reason: 'invalid-reduced-motion-timeline',
      diagnostics: [
        {
          level: 'error',
          code: 'timeline-empty-keyframes',
          source: 'motion-timeline-validator'
        },
        {
          level: 'error',
          code: 'timeline-invalid-duration',
          source: 'motion-timeline-validator'
        }
      ]
    });

    expect(driver.getCalls()).toHaveLength(0);
  });

  it('returns failed result when timeline building throws', async () => {
    const { engine, registry, driver } = createEngine();

    registry.register(new ThrowingMotionDefinition());

    const result = await engine.play('target-1', {
      id: 'motion_005',
      type: 'throwing-motion',
      trigger: 'onEnter'
    });

    expect(result.status).toBe('failed');
    expect(result.reason).toBe('motion-engine-error');
    expect(result.error).toBeInstanceOf(Error);

    expect(driver.getCalls()).toHaveLength(0);
  });

  it('returns failed result when timeline is invalid', async () => {
    const { engine, registry, driver } = createEngine();

    registry.register(new InvalidTimelineMotionDefinition());

    const result = await engine.play('target-1', {
      id: 'motion_invalid_timeline_001',
      type: 'invalid-timeline-motion',
      trigger: 'onEnter'
    });

    expect(result).toMatchObject({
      status: 'failed',
      reason: 'invalid-timeline',
      diagnostics: [
        {
          level: 'error',
          code: 'timeline-empty-keyframes',
          source: 'motion-timeline-validator',
          metadata: {
            trackIndex: 0,
            stepIndex: 0
          }
        },
        {
          level: 'error',
          code: 'timeline-invalid-duration',
          source: 'motion-timeline-validator',
          metadata: {
            trackIndex: 0,
            stepIndex: 0,
            duration: -1
          }
        }
      ]
    });

    expect(driver.getCalls()).toHaveLength(0);
  });

  it('delegates cancel to the driver', async () => {
    const { engine, driver } = createEngine();

    const result = await engine.cancel('target-1');

    expect(result).toEqual({
      status: 'cancelled',
      reason: 'test-driver-cancel'
    });

    expect(driver.getControlCalls()).toEqual([
      {
        action: 'cancel',
        target: 'target-1'
      }
    ]);
  });

  it('delegates finish to the driver', async () => {
    const { engine, driver } = createEngine();

    const result = await engine.finish('target-1');

    expect(result).toEqual({
      status: 'finished',
      reason: 'test-driver-finish'
    });

    expect(driver.getControlCalls()).toEqual([
      {
        action: 'finish',
        target: 'target-1'
      }
    ]);
  });

  it('delegates reset to the driver', async () => {
    const { engine, driver } = createEngine();

    const result = await engine.reset('target-1');

    expect(result).toEqual({
      status: 'finished',
      reason: 'test-driver-reset'
    });

    expect(driver.getControlCalls()).toEqual([
      {
        action: 'reset',
        target: 'target-1'
      }
    ]);
  });

  it('creates a playback controller', async () => {
    const { engine, registry } = createEngine();

    registry.register(new TestMotionDefinition());

    const playback = engine.createPlayback('target-1', {
      id: 'motion_playback_001',
      type: 'test-motion',
      trigger: 'onClick'
    });

    expect(playback.id).toBe('motion_playback_001');
    expect(playback.status).toBe('running');

    await expect(playback.finished).resolves.toEqual({
      status: 'finished'
    });

    expect(playback.status).toBe('finished');
  });

  it('creates fallback playback when timeline is invalid', async () => {
    const { engine, registry, driver } = createEngine();

    registry.register(new InvalidTimelineMotionDefinition());

    const playback = engine.createPlayback('target-1', {
      id: 'motion_invalid_playback_001',
      type: 'invalid-timeline-motion',
      trigger: 'onClick'
    });

    expect(playback.id).toBe('motion_invalid_playback_001');

    await expect(playback.finished).resolves.toMatchObject({
      status: 'failed',
      reason: 'invalid-timeline',
      diagnostics: [
        {
          level: 'error',
          code: 'timeline-empty-keyframes',
          source: 'motion-timeline-validator'
        },
        {
          level: 'error',
          code: 'timeline-invalid-duration',
          source: 'motion-timeline-validator'
        }
      ]
    });

    expect(driver.getCalls()).toHaveLength(0);
  });

  it('cancels a playback controller', async () => {
    const { engine, registry, driver } = createEngine();

    registry.register(new TestMotionDefinition());

    const playback = engine.createPlayback('target-1', {
      id: 'motion_playback_cancel_001',
      type: 'test-motion',
      trigger: 'onClick'
    });

    const result = await playback.cancel();

    expect(result).toEqual({
      status: 'cancelled',
      reason: 'test-driver-cancel'
    });

    expect(playback.status).toBe('cancelled');

    expect(driver.getControlCalls()).toContainEqual({
      action: 'cancel',
      target: 'target-1'
    });
  });

  it('finishes a playback controller', async () => {
    const { engine, registry, driver } = createEngine();

    registry.register(new TestMotionDefinition());

    const playback = engine.createPlayback('target-1', {
      id: 'motion_playback_finish_001',
      type: 'test-motion',
      trigger: 'onClick'
    });

    const result = await playback.finish();

    expect(result).toEqual({
      status: 'finished',
      reason: 'test-driver-finish'
    });

    expect(playback.status).toBe('finished');

    expect(driver.getControlCalls()).toContainEqual({
      action: 'finish',
      target: 'target-1'
    });
  });

  it('delegates playback creation to the driver when supported', async () => {
    const registry = new DefaultMotionRegistry();
    const driver = new NativePlaybackTestDriver();
    const normalizer = new DefaultMotionConfigNormalizer();

    const engine = new DefaultMotionEngine<string>({
      registry,
      driver,
      normalizer
    });

    registry.register(new TestMotionDefinition());

    const playback = engine.createPlayback('target-1', {
      id: 'motion_native_playback_001',
      type: 'test-motion',
      trigger: 'onClick',
      duration: 400,
      delay: 50,
      easing: 'ease-out',
      conflictStrategy: 'parallel',
      options: {
        intensity: 0.8
      }
    });

    expect(playback).toBe(driver.controller);
    expect(driver.playCalls).toHaveLength(0);
    expect(driver.createPlaybackCalls).toHaveLength(1);

    expect(driver.createPlaybackCalls[0]).toEqual({
      target: 'target-1',
      timeline: {
        tracks: [
          {
            target: {
              type: 'self'
            },
            steps: [
              {
                duration: 400,
                delay: 50,
                easing: 'ease-out',
                keyframes: [
                  {
                    opacity: 0
                  },
                  {
                    opacity: 0.8
                  }
                ]
              }
            ]
          }
        ]
      },
      options: {
        trigger: 'onClick',
        respectReducedMotion: true,
        reducedMotionStrategy: 'skip',
        timelineValidated: true,
        conflictStrategy: 'parallel'
      }
    });

    await expect(playback.finished).resolves.toEqual({
      status: 'finished'
    });
  });

  it('passes validated reduced motion timeline flag to native playback driver', async () => {
    const registry = new DefaultMotionRegistry();
    const driver = new NativePlaybackTestDriver();
    const normalizer = new DefaultMotionConfigNormalizer();

    const engine = new DefaultMotionEngine<string>({
      registry,
      driver,
      normalizer
    });

    registry.register(new ReducedMotionAwareMotionDefinition());

    engine.createPlayback('target-1', {
      id: 'motion_native_reduced_playback_001',
      type: 'reduced-aware-motion',
      trigger: 'onClick',
      duration: 400,
      reducedMotionStrategy: 'simplify'
    });

    expect(driver.createPlaybackCalls).toHaveLength(1);
    expect(driver.createPlaybackCalls[0]?.options.timelineValidated).toBe(true);
    expect(driver.createPlaybackCalls[0]?.options.reducedMotionTimelineValidated).toBe(true);
  });
});
