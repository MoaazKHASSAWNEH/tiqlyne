import { describe, expect, it } from 'vitest';
import { prepareMotionTimeline } from '../compiler/prepare-motion-timeline';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { scheduleMotionTimeline } from '../scheduler/schedule-motion-timeline';
import { createMotionExecutionPlanSummary } from './create-motion-execution-plan-summary';

describe('createMotionExecutionPlanSummary', () => {
  it('creates summary from prepared and scheduled timeline', () => {
    const preparedTimeline = prepareMotionTimeline(createTimeline());
    const scheduledTimeline = scheduleMotionTimeline(preparedTimeline);

    const summary = createMotionExecutionPlanSummary({
      preparedTimeline,
      scheduledTimeline
    });

    expect(summary).toEqual({
      trackCount: 2,
      taskCount: 3,
      totalDuration: 350,
      hasReducedMotionTimeline: false
    });
  });

  it('includes reduced motion total duration when reduced timeline exists', () => {
    const preparedTimeline = prepareMotionTimeline(createTimeline());
    const scheduledTimeline = scheduleMotionTimeline(preparedTimeline);
    const preparedReducedMotionTimeline = prepareMotionTimeline(createReducedTimeline());
    const scheduledReducedMotionTimeline = scheduleMotionTimeline(preparedReducedMotionTimeline);

    const summary = createMotionExecutionPlanSummary({
      preparedTimeline,
      scheduledTimeline,
      preparedReducedMotionTimeline,
      scheduledReducedMotionTimeline
    });

    expect(summary).toEqual({
      trackCount: 2,
      taskCount: 3,
      totalDuration: 350,
      hasReducedMotionTimeline: true,
      reducedMotionTotalDuration: 120
    });
  });
});

function createTimeline(): MotionTimelineDefinition {
  return {
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
              }
            ]
          },
          {
            duration: 200,
            delay: 50,
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
            duration: 150,
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
}

function createReducedTimeline(): MotionTimelineDefinition {
  return {
    tracks: [
      {
        target: {
          type: 'self'
        },
        steps: [
          {
            duration: 120,
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
}
