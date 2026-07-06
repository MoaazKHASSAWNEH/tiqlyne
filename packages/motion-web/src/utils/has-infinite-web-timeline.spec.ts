import type { MotionTimelineDefinition } from '@tiqlyne/motion-core';
import { describe, expect, it } from 'vitest';
import { hasInfiniteWebTimeline } from './has-infinite-web-timeline';

describe('hasInfiniteWebTimeline', () => {
  it('returns false for finite timelines', () => {
    expect(hasInfiniteWebTimeline(createTimeline())).toBe(false);
  });

  it('returns true when a step has infinite iterations', () => {
    expect(
      hasInfiniteWebTimeline(
        createTimeline({
          iterations: 'infinite'
        })
      )
    ).toBe(true);
  });

  it('returns true when track defaults have infinite iterations', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          defaults: {
            iterations: 'infinite'
          },
          steps: [
            {
              duration: 100,
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

    expect(hasInfiniteWebTimeline(timeline)).toBe(true);
  });

  it('returns true when timeline defaults have infinite iterations', () => {
    const timeline: MotionTimelineDefinition = {
      defaults: {
        iterations: 'infinite'
      },
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

    expect(hasInfiniteWebTimeline(timeline)).toBe(true);
  });

  it('lets step iterations override infinite track defaults', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          defaults: {
            iterations: 'infinite'
          },
          steps: [
            {
              duration: 100,
              iterations: 1,
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

    expect(hasInfiniteWebTimeline(timeline)).toBe(false);
  });

  it('lets track defaults override infinite timeline defaults', () => {
    const timeline: MotionTimelineDefinition = {
      defaults: {
        iterations: 'infinite'
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          defaults: {
            iterations: 1
          },
          steps: [
            {
              duration: 100,
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

    expect(hasInfiniteWebTimeline(timeline)).toBe(false);
  });
});

function createTimeline(
  step: Partial<MotionTimelineDefinition['tracks'][number]['steps'][number]> = {}
): MotionTimelineDefinition {
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
              },
              {
                opacity: 1
              }
            ],
            ...step
          }
        ]
      }
    ]
  };
}
