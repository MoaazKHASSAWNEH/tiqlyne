import { describe, expect, it } from 'vitest';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { createMotionExecutionPlan } from './create-motion-execution-plan';

describe('createMotionExecutionPlan', () => {
  it('creates an execution plan with a prepared timeline', () => {
    const timeline = createTimeline(300);

    const plan = createMotionExecutionPlan({
      timeline
    });

    expect(plan.timeline).toBe(timeline);
    expect(plan.preparedTimeline.source).toBe(timeline);
    expect(plan.preparedTimeline.totalDuration).toBe(300);
    expect(plan.preparedTimeline.tracks[0]?.steps[0]).toMatchObject({
      trackIndex: 0,
      stepIndex: 0,
      startTime: 0,
      endTime: 300,
      duration: 300,
      delay: 0
    });
    expect(plan.diagnostics).toEqual([]);
  });

  it('creates an execution plan with a prepared reduced motion timeline', () => {
    const timeline = createTimeline(300);
    const reducedMotionTimeline = createTimeline(120);

    const plan = createMotionExecutionPlan({
      timeline,
      reducedMotionTimeline
    });

    expect(plan.reducedMotionTimeline).toBe(reducedMotionTimeline);
    expect(plan.preparedReducedMotionTimeline?.source).toBe(reducedMotionTimeline);
    expect(plan.preparedReducedMotionTimeline?.totalDuration).toBe(120);
  });

  it('preserves diagnostics', () => {
    const diagnostic: MotionDiagnostic = {
      level: 'warning',
      code: 'test-diagnostic',
      message: 'Test diagnostic',
      source: 'test'
    };

    const plan = createMotionExecutionPlan({
      timeline: createTimeline(300),
      diagnostics: [diagnostic]
    });

    expect(plan.diagnostics).toEqual([diagnostic]);
  });

  it('uses the longest prepared track as total duration', () => {
    const timeline: MotionTimelineDefinition = {
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
                  opacity: 1
                }
              ]
            }
          ]
        },
        {
          target: {
            type: 'selector',
            selector: '.item'
          },
          steps: [
            {
              duration: 300,
              delay: 50,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    };

    const plan = createMotionExecutionPlan({
      timeline
    });

    expect(plan.preparedTimeline.totalDuration).toBe(350);
  });
});

function createTimeline(duration: number): MotionTimelineDefinition {
  return {
    tracks: [
      {
        target: {
          type: 'self'
        },
        steps: [
          {
            duration,
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
