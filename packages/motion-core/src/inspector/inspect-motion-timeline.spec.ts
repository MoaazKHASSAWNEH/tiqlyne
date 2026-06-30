import { describe, expect, it } from 'vitest';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { inspectMotionTimeline } from './inspect-motion-timeline';

describe('inspectMotionTimeline', () => {
  it('returns timeline summary information', () => {
    const timeline: MotionTimelineDefinition = {
      labels: {
        intro: 0,
        outro: 1000
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 500,
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1
                }
              ]
            },
            {
              at: 700,
              duration: 300,
              keyframes: [
                {
                  transform: {
                    translateX: 0
                  }
                },
                {
                  transform: {
                    translateX: 100
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const inspection = inspectMotionTimeline(timeline);

    expect(inspection).toMatchObject({
      totalDuration: 1000,
      trackCount: 1,
      stepCount: 2,
      labelCount: 2,
      animatedProperties: ['opacity', 'transform']
    });

    expect(inspection.labels).toEqual([
      {
        name: 'intro',
        time: 0
      },
      {
        name: 'outro',
        time: 1000
      }
    ]);

    expect(inspection.tracks[0]?.steps).toHaveLength(2);
  });

  it('reports custom animated properties', () => {
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
                  custom: {
                    '--progress': 0
                  }
                },
                {
                  custom: {
                    '--progress': 1
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const inspection = inspectMotionTimeline(timeline);

    expect(inspection.animatedProperties).toEqual(['custom.--progress']);
  });

  it('reports long timeline and long step diagnostics', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 4000,
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

    const inspection = inspectMotionTimeline(timeline);

    expect(inspection.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'timeline-inspection-long-timeline'
    );
    expect(inspection.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'timeline-inspection-long-step'
    );
  });

  it('reports infinite timeline diagnostics', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              iterations: 'infinite',
              duration: 1000,
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

    const inspection = inspectMotionTimeline(timeline);

    expect(inspection.totalDuration).toBe(Infinity);
    expect(inspection.tracks[0]?.steps[0]?.infinite).toBe(true);
    expect(inspection.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      'timeline-inspection-infinite-timeline'
    );
  });
});
