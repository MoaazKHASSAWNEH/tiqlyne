import { describe, expect, it } from 'vitest';
import { prepareMotionTimeline } from './prepare-motion-timeline';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

describe('prepareMotionTimeline', () => {
  it('prepares a single-step timeline', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
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

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared).toMatchObject({
      source: timeline,
      totalDuration: 300,
      tracks: [
        {
          trackIndex: 0,
          target: {
            type: 'self'
          },
          duration: 300,
          steps: [
            {
              trackIndex: 0,
              stepIndex: 0,
              startTime: 0,
              endTime: 300,
              duration: 300,
              delay: 0
            }
          ]
        }
      ]
    });

    expect(prepared.tracks[0]?.steps[0]?.source).toBe(timeline.tracks[0]?.steps[0]);
  });

  it('includes delay in step timing', () => {
    const prepared = prepareMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              delay: 100,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    });

    expect(prepared.totalDuration).toBe(400);
    expect(prepared.tracks[0]?.duration).toBe(400);
    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      startTime: 100,
      endTime: 400,
      duration: 300,
      delay: 100
    });
  });

  it('prepares sequential steps in the same track', () => {
    const prepared = prepareMotionTimeline({
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
        }
      ]
    });

    expect(prepared.totalDuration).toBe(350);
    expect(prepared.tracks[0]?.steps).toMatchObject([
      {
        stepIndex: 0,
        startTime: 0,
        endTime: 100,
        duration: 100,
        delay: 0
      },
      {
        stepIndex: 1,
        startTime: 150,
        endTime: 350,
        duration: 200,
        delay: 50
      }
    ]);
  });

  it('uses the longest track as total duration', () => {
    const prepared = prepareMotionTimeline({
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
    });

    expect(prepared.totalDuration).toBe(350);
    expect(prepared.tracks.map((track) => track.duration)).toEqual([100, 350]);
  });

  it('preserves easing offset fill and keyframes', () => {
    const keyframes = [
      {
        opacity: 0,
        offset: 0
      },
      {
        opacity: 1,
        offset: 1
      }
    ];

    const prepared = prepareMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 250,
              easing: 'ease-out',
              offset: 0.5,
              fill: 'both',
              keyframes
            }
          ]
        }
      ]
    });

    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      easing: 'ease-out',
      offset: 0.5,
      fill: 'both',
      keyframes
    });
  });

  it('preserves track stagger', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          stagger: 80,
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
        }
      ]
    };

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.tracks[0]?.stagger).toBe(80);
  });

  it('preserves advanced track stagger options', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          stagger: {
            each: 80,
            from: 'center'
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
        }
      ]
    };

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.tracks[0]?.stagger).toEqual({
      each: 80,
      from: 'center'
    });
  });

  it('prepares timeline using timeline defaults', () => {
    const timeline: MotionTimelineDefinition = {
      defaults: {
        duration: 300,
        delay: 50,
        easing: 'ease-out',
        fill: 'both'
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
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

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.source).not.toBe(timeline);
    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      duration: 300,
      delay: 50,
      startTime: 50,
      endTime: 350,
      easing: 'ease-out',
      fill: 'both'
    });
  });

  it('prepares a step using an absolute numeric position', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 200,
              duration: 100,
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

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      startTime: 200,
      endTime: 300,
      duration: 100,
      delay: 0
    });

    expect(prepared.tracks[0]?.duration).toBe(300);
    expect(prepared.totalDuration).toBe(300);
  });

  it('adds step delay to absolute numeric position', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 200,
              delay: 50,
              duration: 100,
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

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      startTime: 250,
      endTime: 350,
      duration: 100,
      delay: 50
    });

    expect(prepared.tracks[0]?.duration).toBe(350);
    expect(prepared.totalDuration).toBe(350);
  });

  it('keeps the timeline cursor at the longest end time when positioned steps overlap', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 0,
              duration: 300,
              keyframes: [
                {
                  opacity: 0
                }
              ]
            },
            {
              at: 100,
              duration: 300,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            },
            {
              duration: 200,
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

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      startTime: 0,
      endTime: 300
    });

    expect(prepared.tracks[0]?.steps[1]).toMatchObject({
      startTime: 100,
      endTime: 400
    });

    expect(prepared.tracks[0]?.steps[2]).toMatchObject({
      startTime: 400,
      endTime: 600
    });

    expect(prepared.tracks[0]?.duration).toBe(600);
    expect(prepared.totalDuration).toBe(600);
  });

  it('prepares a step using a timeline label position', () => {
    const timeline: MotionTimelineDefinition = {
      labels: {
        intro: 200
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 'intro',
              duration: 100,
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

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      startTime: 200,
      endTime: 300,
      duration: 100,
      delay: 0
    });

    expect(prepared.tracks[0]?.duration).toBe(300);
    expect(prepared.totalDuration).toBe(300);
  });

  it('adds step delay to a timeline label position', () => {
    const timeline: MotionTimelineDefinition = {
      labels: {
        intro: 200
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 'intro',
              delay: 50,
              duration: 100,
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

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      startTime: 250,
      endTime: 350,
      duration: 100,
      delay: 50
    });

    expect(prepared.tracks[0]?.duration).toBe(350);
    expect(prepared.totalDuration).toBe(350);
  });

  it('prepares a step using a typed label position', () => {
    const timeline: MotionTimelineDefinition = {
      labels: {
        intro: 200
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                label: 'intro'
              },
              duration: 100,
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

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      startTime: 200,
      endTime: 300
    });

    expect(prepared.totalDuration).toBe(300);
  });

  it('prepares a step using a typed label position with positive offset', () => {
    const timeline: MotionTimelineDefinition = {
      labels: {
        intro: 200
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                label: 'intro',
                offset: 100
              },
              duration: 100,
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

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      startTime: 300,
      endTime: 400
    });

    expect(prepared.totalDuration).toBe(400);
  });

  it('prepares a step using a typed label position with negative offset', () => {
    const timeline: MotionTimelineDefinition = {
      labels: {
        outro: 500
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                label: 'outro',
                offset: -100
              },
              duration: 100,
              keyframes: [
                {
                  opacity: 0
                }
              ]
            }
          ]
        }
      ]
    };

    const prepared = prepareMotionTimeline(timeline);

    expect(prepared.tracks[0]?.steps[0]).toMatchObject({
      startTime: 400,
      endTime: 500
    });

    expect(prepared.totalDuration).toBe(500);
  });
});
