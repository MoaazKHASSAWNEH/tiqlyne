import type { MotionStepDefinition, ScheduledMotionTask } from '@structifyx/motion-core';
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
      endDelay: 100
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
      endDelay: 100
    });

    expect(toWebScheduledTaskTimingOptions(task)).toMatchObject({
      duration: 300,
      delay: 0,
      iterations: 2,
      direction: 'alternate',
      endDelay: 100
    });
  });
});

function createScheduledTask(input: {
  readonly duration: number;
  readonly delay?: number;
  readonly startTime: number;
  readonly easing?: string;
  readonly fill?: FillMode;
  readonly iterations?: number;
  readonly direction?: PlaybackDirection;
  readonly endDelay?: number;
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
      ...(input.endDelay !== undefined
        ? {
            endDelay: input.endDelay
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
        ...(input.endDelay !== undefined
          ? {
              endDelay: input.endDelay
            }
          : {})
      }
    }
  };
}
