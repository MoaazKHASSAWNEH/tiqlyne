import type {
  MotionExecutionPlan,
  MotionPlayOptions,
  MotionTimelineDefinition,
  ScheduledMotionTimeline
} from '@structifyx/motion-core';
import { describe, expect, it } from 'vitest';
import {
  createGenericReducedMotionFallbackDiagnostic,
  resolveWebActiveExecutionPlan,
  resolveWebPlayableTimeline,
  resolveWebReducedMotionDiagnostics,
  resolveWebScheduledTimeline,
  simplifyWebTimeline
} from './resolve-web-reduced-motion';

const defaultPlayOptions: MotionPlayOptions = {
  trigger: 'manual',
  respectReducedMotion: true,
  reducedMotionStrategy: 'preserve',
  conflictStrategy: 'replace'
};

describe('createGenericReducedMotionFallbackDiagnostic', () => {
  it('creates a reduced motion fallback diagnostic', () => {
    expect(createGenericReducedMotionFallbackDiagnostic('web')).toEqual({
      level: 'warning',
      code: 'reduced-motion-fallback-used',
      message:
        'Generic reduced motion fallback was used because no motion-specific reduced timeline was provided.',
      source: 'web',
      metadata: {
        strategy: 'simplify'
      }
    });
  });
});

describe('simplifyWebTimeline', () => {
  it('simplifies timeline duration, delay, easing and keyframes', () => {
    const timeline = createTimeline({
      duration: 300,
      delay: 80,
      easing: 'ease-in',
      fill: 'forwards'
    });

    expect(simplifyWebTimeline(timeline)).toEqual({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1,
                  offset: 1
                }
              ],
              duration: 150,
              delay: 0,
              easing: 'ease-out',
              fill: 'forwards'
            }
          ]
        }
      ]
    });
  });

  it('keeps short durations below the reduced motion cap', () => {
    const timeline = createTimeline({
      duration: 90
    });

    expect(simplifyWebTimeline(timeline).tracks[0]?.steps[0]?.duration).toBe(90);
  });
});

describe('resolveWebPlayableTimeline', () => {
  it('uses execution plan timeline when reduced motion is not applied', () => {
    const timeline = createTimeline({
      duration: 100
    });
    const plannedTimeline = createTimeline({
      duration: 200
    });

    const executionPlan = createExecutionPlan({
      timeline: plannedTimeline
    });

    expect(
      resolveWebPlayableTimeline(
        timeline,
        {
          ...defaultPlayOptions,
          executionPlan
        },
        false
      )
    ).toBe(plannedTimeline);
  });

  it('uses execution plan reduced motion timeline when simplifying', () => {
    const timeline = createTimeline({
      duration: 300
    });
    const reducedMotionTimeline = createTimeline({
      duration: 60
    });

    const executionPlan = createExecutionPlan({
      timeline,
      reducedMotionTimeline
    });

    expect(
      resolveWebPlayableTimeline(
        timeline,
        {
          ...defaultPlayOptions,
          reducedMotionStrategy: 'simplify',
          executionPlan
        },
        true
      )
    ).toBe(reducedMotionTimeline);
  });

  it('uses provided reduced motion timeline when no execution plan reduced timeline exists', () => {
    const timeline = createTimeline({
      duration: 300
    });
    const reducedMotionTimeline = createTimeline({
      duration: 70
    });

    expect(
      resolveWebPlayableTimeline(
        timeline,
        {
          ...defaultPlayOptions,
          reducedMotionStrategy: 'simplify',
          reducedMotionTimeline
        },
        true
      )
    ).toBe(reducedMotionTimeline);
  });

  it('creates a generic simplified timeline when no reduced motion timeline is provided', () => {
    const timeline = createTimeline({
      duration: 300
    });

    expect(
      resolveWebPlayableTimeline(
        timeline,
        {
          ...defaultPlayOptions,
          reducedMotionStrategy: 'simplify'
        },
        true
      )
    ).toEqual(simplifyWebTimeline(timeline));
  });
});

describe('resolveWebActiveExecutionPlan', () => {
  it('returns undefined when no execution plan is provided', () => {
    expect(resolveWebActiveExecutionPlan(defaultPlayOptions, false)).toBeUndefined();
  });

  it('returns execution plan when reduced motion is not applied', () => {
    const executionPlan = createExecutionPlan({
      timeline: createTimeline({
        duration: 100
      })
    });

    expect(
      resolveWebActiveExecutionPlan(
        {
          ...defaultPlayOptions,
          executionPlan
        },
        false
      )
    ).toBe(executionPlan);
  });

  it('returns undefined when simplifying but execution plan has no scheduled reduced motion timeline', () => {
    const executionPlan = createExecutionPlan({
      timeline: createTimeline({
        duration: 100
      })
    });

    expect(
      resolveWebActiveExecutionPlan(
        {
          ...defaultPlayOptions,
          reducedMotionStrategy: 'simplify',
          executionPlan
        },
        true
      )
    ).toBeUndefined();
  });

  it('returns execution plan when simplifying and scheduled reduced motion timeline exists', () => {
    const executionPlan = createExecutionPlan({
      timeline: createTimeline({
        duration: 100
      }),
      reducedMotionTimeline: createTimeline({
        duration: 60
      }),
      scheduledReducedMotionTimeline: createScheduledTimeline()
    });

    expect(
      resolveWebActiveExecutionPlan(
        {
          ...defaultPlayOptions,
          reducedMotionStrategy: 'simplify',
          executionPlan
        },
        true
      )
    ).toBe(executionPlan);
  });
});

describe('resolveWebScheduledTimeline', () => {
  it('returns undefined when no execution plan is provided', () => {
    expect(resolveWebScheduledTimeline(undefined, false, defaultPlayOptions)).toBeUndefined();
  });

  it('returns scheduled timeline when not simplifying', () => {
    const scheduledTimeline = createScheduledTimeline();

    const executionPlan = createExecutionPlan({
      timeline: createTimeline({
        duration: 100
      }),
      scheduledTimeline
    });

    expect(resolveWebScheduledTimeline(executionPlan, false, defaultPlayOptions)).toBe(
      scheduledTimeline
    );
  });

  it('returns scheduled reduced motion timeline when simplifying', () => {
    const scheduledReducedMotionTimeline = createScheduledTimeline();

    const executionPlan = createExecutionPlan({
      timeline: createTimeline({
        duration: 100
      }),
      scheduledReducedMotionTimeline
    });

    expect(
      resolveWebScheduledTimeline(executionPlan, true, {
        ...defaultPlayOptions,
        reducedMotionStrategy: 'simplify'
      })
    ).toBe(scheduledReducedMotionTimeline);
  });
});

describe('resolveWebReducedMotionDiagnostics', () => {
  it('returns a fallback diagnostic when simplifying without reduced motion timeline', () => {
    expect(
      resolveWebReducedMotionDiagnostics(
        {
          ...defaultPlayOptions,
          reducedMotionStrategy: 'simplify'
        },
        true,
        'web'
      )
    ).toEqual([createGenericReducedMotionFallbackDiagnostic('web')]);
  });

  it('returns no diagnostics when reduced motion timeline is provided', () => {
    expect(
      resolveWebReducedMotionDiagnostics(
        {
          ...defaultPlayOptions,
          reducedMotionStrategy: 'simplify',
          reducedMotionTimeline: createTimeline({
            duration: 60
          })
        },
        true,
        'web'
      )
    ).toEqual([]);
  });

  it('returns no diagnostics when reduced motion is not applied', () => {
    expect(
      resolveWebReducedMotionDiagnostics(
        {
          ...defaultPlayOptions,
          reducedMotionStrategy: 'simplify'
        },
        false,
        'web'
      )
    ).toEqual([]);
  });
});

function createTimeline(input: {
  readonly duration: number;
  readonly delay?: number;
  readonly easing?: string;
  readonly fill?: FillMode;
}): MotionTimelineDefinition {
  return {
    tracks: [
      {
        target: {
          type: 'self'
        },
        steps: [
          {
            duration: input.duration,
            ...(input.delay !== undefined
              ? {
                  delay: input.delay
                }
              : {}),
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
            keyframes: [
              {
                opacity: 0
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
}

function createExecutionPlan(input: {
  readonly timeline: MotionTimelineDefinition;
  readonly scheduledTimeline?: ScheduledMotionTimeline;
  readonly reducedMotionTimeline?: MotionTimelineDefinition;
  readonly scheduledReducedMotionTimeline?: ScheduledMotionTimeline;
}): MotionExecutionPlan {
  return {
    timeline: input.timeline,
    preparedTimeline: {} as MotionExecutionPlan['preparedTimeline'],
    scheduledTimeline: input.scheduledTimeline ?? createScheduledTimeline(),
    ...(input.reducedMotionTimeline !== undefined
      ? {
          reducedMotionTimeline: input.reducedMotionTimeline
        }
      : {}),
    ...(input.scheduledReducedMotionTimeline !== undefined
      ? {
          scheduledReducedMotionTimeline: input.scheduledReducedMotionTimeline
        }
      : {}),
    summary: {
      trackCount: 1,
      taskCount: 1,
      totalDuration: 100,
      hasReducedMotionTimeline: input.reducedMotionTimeline !== undefined
    },
    diagnostics: []
  };
}

function createScheduledTimeline(): ScheduledMotionTimeline {
  const timeline = createTimeline({
    duration: 100
  });

  return {
    source: {
      source: timeline,
      tracks: [],
      totalDuration: 0
    },
    tasks: [],
    totalDuration: 0
  };
}
