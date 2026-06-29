import { describe, expect, it } from 'vitest';
import { MotionPlanningError } from '../engine/motion-planning-error';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import {
  sampleMotionTimeline,
  sampleMotionTimelineAtProgress,
  sampleMotionTimelineAtTime
} from './sample-motion-timeline';

describe('sampleMotionTimeline', () => {
  it('samples opacity at a specific time', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: { type: 'self' },
          steps: [
            {
              duration: 1000,
              keyframes: [{ opacity: 0 }, { opacity: 1 }]
            }
          ]
        }
      ]
    };

    const sample = sampleMotionTimelineAtTime(timeline, 500);

    expect(sample.time).toBe(500);
    expect(sample.progress).toBe(0.5);
    expect(sample.duration).toBe(1000);
    expect(sample.activeSteps).toHaveLength(1);
    expect(sample.activeSteps[0]?.keyframe.opacity).toBe(0.5);
  });

  it('samples opacity at a specific progress', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: { type: 'self' },
          steps: [
            {
              duration: 1000,
              keyframes: [{ opacity: 0 }, { opacity: 1 }]
            }
          ]
        }
      ]
    };

    const sample = sampleMotionTimelineAtProgress(timeline, 0.25);

    expect(sample.time).toBe(250);
    expect(sample.progress).toBe(0.25);
    expect(sample.activeSteps[0]?.keyframe.opacity).toBe(0.25);
  });

  it('marks steps as pending active and completed', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: { type: 'self' },
          steps: [
            {
              duration: 100,
              keyframes: [{ opacity: 0 }, { opacity: 1 }]
            },
            {
              at: 200,
              duration: 100,
              keyframes: [{ opacity: 1 }, { opacity: 0 }]
            }
          ]
        }
      ]
    };

    const sample = sampleMotionTimelineAtTime(timeline, 150);

    expect(sample.completedSteps).toHaveLength(1);
    expect(sample.pendingSteps).toHaveLength(1);
    expect(sample.activeSteps).toHaveLength(0);
  });

  it('respects labels through preparation', () => {
    const timeline: MotionTimelineDefinition = {
      labels: {
        intro: 300
      },
      tracks: [
        {
          target: { type: 'self' },
          steps: [
            {
              at: 'intro',
              duration: 100,
              keyframes: [{ opacity: 0 }, { opacity: 1 }]
            }
          ]
        }
      ]
    };

    const sample = sampleMotionTimelineAtTime(timeline, 350);

    expect(sample.activeSteps).toHaveLength(1);
    expect(sample.activeSteps[0]?.progress).toBe(0.5);
    expect(sample.activeSteps[0]?.keyframe.opacity).toBe(0.5);
  });

  it('samples custom numeric properties', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: { type: 'self' },
          steps: [
            {
              duration: 100,
              keyframes: [
                {
                  custom: {
                    x: 0
                  }
                },
                {
                  custom: {
                    x: 100
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const sample = sampleMotionTimelineAtTime(timeline, 50);

    expect(sample.activeSteps[0]?.keyframe.custom?.x).toBe(50);
  });

  it('supports reverse direction sampling', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: { type: 'self' },
          steps: [
            {
              duration: 100,
              direction: 'reverse',
              keyframes: [{ opacity: 0 }, { opacity: 1 }]
            }
          ]
        }
      ]
    };

    const sample = sampleMotionTimelineAtTime(timeline, 25);

    expect(sample.activeSteps[0]?.progress).toBe(0.75);
    expect(sample.activeSteps[0]?.keyframe.opacity).toBe(0.75);
  });

  it('supports yoyo sampling', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: { type: 'self' },
          steps: [
            {
              duration: 100,
              iterations: 2,
              yoyo: true,
              keyframes: [{ opacity: 0 }, { opacity: 1 }]
            }
          ]
        }
      ]
    };

    const sample = sampleMotionTimelineAtTime(timeline, 150);

    expect(sample.activeSteps[0]?.progress).toBe(0.5);
    expect(sample.activeSteps[0]?.keyframe.opacity).toBe(0.5);
  });

  it('throws when progress sampling an infinite timeline', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: { type: 'self' },
          steps: [
            {
              duration: 100,
              iterations: 'infinite',
              keyframes: [{ opacity: 0 }, { opacity: 1 }]
            }
          ]
        }
      ]
    };

    expect(() => sampleMotionTimelineAtProgress(timeline, 0.5)).toThrow(MotionPlanningError);
  });

  it('uses sampleMotionTimeline with time input', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: { type: 'self' },
          steps: [
            {
              duration: 100,
              keyframes: [{ opacity: 0 }, { opacity: 1 }]
            }
          ]
        }
      ]
    };

    const sample = sampleMotionTimeline(timeline, {
      time: 50
    });

    expect(sample.activeSteps[0]?.keyframe.opacity).toBe(0.5);
  });
});
