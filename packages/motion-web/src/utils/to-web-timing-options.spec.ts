import type { MotionStepDefinition, ScheduledMotionTask, MotionEasing } from '@tiqlyne/motion-core';
import { describe, expect, it } from 'vitest';
import { toWebScheduledTaskTimingOptions, toWebStepTimingOptions } from './to-web-timing-options';

describe('toWebStepTimingOptions', () => {
  it('converts a motion step to Web Animations timing options', () => {
    const step: MotionStepDefinition = {
      duration: 250,
      delay: 40,
      easing: 'ease-out',
      fill: 'forwards',
      keyframes: [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ]
    };

    expect(toWebStepTimingOptions(step)).toEqual({
      duration: 250,
      delay: 40,
      easing: 'ease-out',
      fill: 'forwards'
    });
  });

  it('uses default timing values for optional step properties', () => {
    const step: MotionStepDefinition = {
      duration: 250,
      keyframes: [
        {
          opacity: 1
        }
      ]
    };

    expect(toWebStepTimingOptions(step)).toEqual({
      duration: 250,
      delay: 0,
      easing: 'ease',
      fill: 'both'
    });
  });

  it('maps playback timing options for a motion step', () => {
    expect(
      toWebStepTimingOptions({
        duration: 300,
        delay: 0,
        iterations: 2,
        direction: 'alternate',
        endDelay: 100,
        playbackRate: 2,
        keyframes: [
          {
            opacity: 1
          }
        ]
      })
    ).toMatchObject({
      duration: 300,
      delay: 0,
      iterations: 2,
      direction: 'alternate',
      endDelay: 100,
      playbackRate: 2
    });
  });
});

describe('toWebScheduledTaskTimingOptions', () => {
  it('converts a scheduled task to Web Animations timing options', () => {
    const task = createScheduledTask({
      duration: 200,
      startTime: 150,
      easing: 'linear',
      fill: 'both'
    });

    expect(toWebScheduledTaskTimingOptions(task)).toEqual({
      duration: 200,
      delay: 150,
      easing: 'linear',
      fill: 'both'
    });
  });

  it('uses task start time instead of task delay', () => {
    const task = createScheduledTask({
      duration: 200,
      delay: 50,
      startTime: 150
    });

    expect(toWebScheduledTaskTimingOptions(task)).toEqual({
      duration: 200,
      delay: 150,
      easing: 'ease',
      fill: 'both'
    });
  });

  it('maps playback timing options for a scheduled task', () => {
    const task = createScheduledTask({
      duration: 300,
      startTime: 0,
      iterations: 2,
      direction: 'alternate',
      endDelay: 100,
      playbackRate: 2
    });

    expect(toWebScheduledTaskTimingOptions(task)).toMatchObject({
      duration: 300,
      delay: 0,
      iterations: 2,
      direction: 'alternate',
      endDelay: 100,
      playbackRate: 2
    });
  });

  it('maps infinite step iterations to Web Animations Infinity', () => {
    const timing = toWebStepTimingOptions({
      duration: 300,
      iterations: 'infinite',
      keyframes: [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ]
    });

    expect(timing.iterations).toBe(Infinity);
  });

  it('maps infinite scheduled task iterations to Web Animations Infinity', () => {
    const timing = toWebScheduledTaskTimingOptions({
      taskIndex: 0,
      trackIndex: 0,
      stepIndex: 0,
      startTime: 100,
      endTime: Infinity,
      duration: 300,
      delay: 0,
      step: {
        trackIndex: 0,
        stepIndex: 0,
        startTime: 100,
        endTime: Infinity,
        duration: 300,
        delay: 0,
        keyframes: [
          {
            opacity: 0
          },
          {
            opacity: 1
          }
        ],
        iterations: 'infinite',
        activeDuration: Infinity,
        source: {
          duration: 300,
          iterations: 'infinite',
          keyframes: [
            {
              opacity: 0
            },
            {
              opacity: 1
            }
          ]
        }
      }
    });

    expect(timing.iterations).toBe(Infinity);
  });

  it('maps cubic bezier easing objects to web easing strings', () => {
    expect(
      toWebStepTimingOptions({
        duration: 300,
        easing: {
          type: 'cubicBezier',
          x1: 0.16,
          y1: 1,
          x2: 0.3,
          y2: 1
        },
        keyframes: [
          {
            opacity: 1
          }
        ]
      }).easing
    ).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
  });

  it('maps steps easing objects to web easing strings', () => {
    expect(
      toWebStepTimingOptions({
        duration: 300,
        easing: {
          type: 'steps',
          count: 4,
          position: 'end'
        },
        keyframes: [
          {
            opacity: 1
          }
        ]
      }).easing
    ).toBe('steps(4, end)');
  });

  it('maps yoyo to alternate web direction', () => {
    expect(
      toWebStepTimingOptions({
        duration: 300,
        yoyo: true,
        keyframes: [
          {
            opacity: 1
          }
        ]
      }).direction
    ).toBe('alternate');
  });
});

function createScheduledTask(input: {
  readonly duration: number;
  readonly delay?: number;
  readonly startTime: number;
  readonly easing?: MotionEasing;
  readonly fill?: FillMode;
  readonly iterations?: number;
  readonly direction?: PlaybackDirection;
  readonly yoyo?: boolean;
  readonly endDelay?: number;
  readonly playbackRate?: number;
}): ScheduledMotionTask {
  const activeDuration = input.duration * (input.iterations ?? 1) + (input.endDelay ?? 0);

  return {
    taskIndex: 0,
    trackIndex: 0,
    stepIndex: 0,
    startTime: input.startTime,
    endTime: input.startTime + activeDuration,
    duration: input.duration,
    delay: input.delay ?? 0,
    step: {
      trackIndex: 0,
      stepIndex: 0,
      startTime: input.startTime,
      endTime: input.startTime + activeDuration,
      duration: input.duration,
      activeDuration,
      delay: input.delay ?? 0,
      keyframes: [
        {
          opacity: 1
        }
      ],
      ...(input.easing !== undefined
        ? {
            easing: input.easing
          }
        : {}),
      ...(input.fill !== undefined
        ? {
            fill: input.fill
          }
        : {}),
      ...(input.iterations !== undefined
        ? {
            iterations: input.iterations
          }
        : {}),
      ...(input.direction !== undefined
        ? {
            direction: input.direction
          }
        : {}),
      ...(input.yoyo !== undefined
        ? {
            yoyo: input.yoyo
          }
        : {}),
      ...(input.endDelay !== undefined
        ? {
            endDelay: input.endDelay
          }
        : {}),
      ...(input.playbackRate !== undefined
        ? {
            playbackRate: input.playbackRate
          }
        : {}),
      source: {
        duration: input.duration,
        delay: input.delay ?? 0,
        keyframes: [
          {
            opacity: 1
          }
        ],
        ...(input.easing !== undefined
          ? {
              easing: input.easing
            }
          : {}),
        ...(input.fill !== undefined
          ? {
              fill: input.fill
            }
          : {}),
        ...(input.iterations !== undefined
          ? {
              iterations: input.iterations
            }
          : {}),
        ...(input.direction !== undefined
          ? {
              direction: input.direction
            }
          : {}),
        ...(input.yoyo !== undefined
          ? {
              yoyo: input.yoyo
            }
          : {}),
        ...(input.endDelay !== undefined
          ? {
              endDelay: input.endDelay
            }
          : {}),
        ...(input.playbackRate !== undefined
          ? {
              playbackRate: input.playbackRate
            }
          : {})
      }
    }
  };
}
