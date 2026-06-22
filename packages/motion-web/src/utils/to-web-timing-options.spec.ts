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
});

function createScheduledTask(input: {
  readonly duration: number;
  readonly delay?: number;
  readonly startTime: number;
  readonly easing?: string;
  readonly fill?: FillMode;
}): ScheduledMotionTask {
  return {
    taskIndex: 0,
    trackIndex: 0,
    stepIndex: 0,
    startTime: input.startTime,
    endTime: input.startTime + input.duration,
    duration: input.duration,
    delay: input.delay ?? 0,
    step: {
      trackIndex: 0,
      stepIndex: 0,
      startTime: input.startTime,
      endTime: input.startTime + input.duration,
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
      source: {
        duration: input.duration,
        delay: input.delay ?? 0,
        keyframes: [
          {
            opacity: 1
          }
        ]
      }
    }
  };
}
