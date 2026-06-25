import { describe, expect, it } from 'vitest';
import { createMotionTimeline, createMotionTimelineBuilder } from './create-motion-timeline';

describe('createMotionTimeline', () => {
  it('builds a timeline with defaults, labels, tracks, steps and keyframes', () => {
    const timeline = createMotionTimeline((timelineBuilder) => {
      timelineBuilder.defaults({
        duration: 300,
        easing: 'ease-out',
        fill: 'both'
      });

      timelineBuilder.label('intro', 0);
      timelineBuilder.label('outro', 1200);

      timelineBuilder.track('self', (track) => {
        track.step({ at: 'intro' }, (step) => {
          step.from({
            opacity: 0,
            transform: {
              y: 24
            }
          });

          step.to({
            opacity: 1,
            transform: {
              y: 0
            }
          });
        });

        track.step({ at: 'outro', duration: 200 }, (step) => {
          step.to({
            opacity: 0
          });
        });
      });
    });

    expect(timeline).toEqual({
      defaults: {
        duration: 300,
        easing: 'ease-out',
        fill: 'both'
      },
      labels: {
        intro: 0,
        outro: 1200
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 'intro',
              keyframes: [
                {
                  opacity: 0,
                  transform: {
                    y: 24
                  },
                  offset: 0
                },
                {
                  opacity: 1,
                  transform: {
                    y: 0
                  },
                  offset: 1
                }
              ]
            },
            {
              at: 'outro',
              duration: 200,
              keyframes: [
                {
                  opacity: 0,
                  offset: 1
                }
              ]
            }
          ]
        }
      ]
    });
  });

  it('builds multiple tracks with explicit targets', () => {
    const timeline = createMotionTimeline((timelineBuilder) => {
      timelineBuilder.track('self', (track) => {
        track.step({ duration: 300 }, (step) => {
          step.from({ opacity: 0 });
          step.to({ opacity: 1 });
        });
      });

      timelineBuilder.track({ type: 'child', name: 'title' }, (track) => {
        track.step({ at: 100, duration: 250 }, (step) => {
          step.from({
            opacity: 0,
            transform: {
              x: -16
            }
          });

          step.to({
            opacity: 1,
            transform: {
              x: 0
            }
          });
        });
      });

      timelineBuilder.track({ type: 'selector', selector: '.item' }, (track) => {
        track.step({ at: 200, duration: 200 }, (step) => {
          step.from({
            opacity: 0,
            transform: {
              y: 12
            }
          });

          step.to({
            opacity: 1,
            transform: {
              y: 0
            }
          });
        });
      });
    });

    expect(timeline.tracks).toHaveLength(3);
    expect(timeline.tracks[0]?.target).toEqual({ type: 'self' });
    expect(timeline.tracks[1]?.target).toEqual({ type: 'child', name: 'title' });
    expect(timeline.tracks[2]?.target).toEqual({ type: 'selector', selector: '.item' });
  });

  it('builds track defaults and stagger', () => {
    const timeline = createMotionTimeline((timelineBuilder) => {
      timelineBuilder.track({ type: 'selector', selector: '.item' }, (track) => {
        track.defaults({
          duration: 200,
          easing: 'ease-in-out'
        });

        track.stagger({
          each: 80,
          from: 'center'
        });

        track.step((step) => {
          step.from({
            opacity: 0,
            transform: {
              y: 12
            }
          });

          step.to({
            opacity: 1,
            transform: {
              y: 0
            }
          });
        });
      });
    });

    expect(timeline.tracks[0]).toEqual({
      target: {
        type: 'selector',
        selector: '.item'
      },
      defaults: {
        duration: 200,
        easing: 'ease-in-out'
      },
      stagger: {
        each: 80,
        from: 'center'
      },
      steps: [
        {
          keyframes: [
            {
              opacity: 0,
              transform: {
                y: 12
              },
              offset: 0
            },
            {
              opacity: 1,
              transform: {
                y: 0
              },
              offset: 1
            }
          ]
        }
      ]
    });
  });

  it('allows precise keyframes with custom offsets', () => {
    const timeline = createMotionTimeline((timelineBuilder) => {
      timelineBuilder.track('self', (track) => {
        track.step({ duration: 500 }, (step) => {
          step.keyframe({
            offset: 0,
            opacity: 0
          });

          step.keyframe({
            offset: 0.4,
            opacity: 0.6
          });

          step.keyframe({
            offset: 1,
            opacity: 1
          });
        });
      });
    });

    expect(timeline.tracks[0]?.steps[0]?.keyframes).toEqual([
      {
        offset: 0,
        opacity: 0
      },
      {
        offset: 0.4,
        opacity: 0.6
      },
      {
        offset: 1,
        opacity: 1
      }
    ]);
  });

  it('allows manual builder usage', () => {
    const builder = createMotionTimelineBuilder();

    builder.defaults({
      duration: 300
    });

    builder.track('self', (track) => {
      track.step((step) => {
        step.from({ opacity: 0 });
        step.to({ opacity: 1 });
      });
    });

    expect(builder.build()).toEqual({
      defaults: {
        duration: 300
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
                  opacity: 0,
                  offset: 0
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
    });
  });
});
