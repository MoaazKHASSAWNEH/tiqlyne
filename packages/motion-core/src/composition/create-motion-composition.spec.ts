import { describe, expect, it } from 'vitest';
import { MotionCompositionBuilder } from './motion-composition-builder';
import { createMotionComposition } from './create-motion-composition';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

describe('MotionCompositionBuilder', () => {
  it('builds an empty composition', () => {
    const composition = new MotionCompositionBuilder().build();

    expect(composition).toEqual({
      items: []
    });
  });

  it('adds composition defaults', () => {
    const composition = new MotionCompositionBuilder()
      .defaults({
        duration: 300,
        easing: 'ease-out',
        fill: 'both'
      })
      .build();

    expect(composition).toEqual({
      defaults: {
        duration: 300,
        easing: 'ease-out',
        fill: 'both'
      },
      items: []
    });
  });

  it('merges composition defaults', () => {
    const composition = new MotionCompositionBuilder()
      .defaults({
        duration: 300,
        easing: 'ease-out'
      })
      .defaults({
        delay: 50,
        easing: 'linear'
      })
      .build();

    expect(composition.defaults).toEqual({
      duration: 300,
      delay: 50,
      easing: 'linear'
    });
  });

  it('adds one label', () => {
    const composition = new MotionCompositionBuilder().label('start', 0).build();

    expect(composition).toEqual({
      labels: {
        start: 0
      },
      items: []
    });
  });

  it('adds multiple labels', () => {
    const composition = new MotionCompositionBuilder()
      .label('start', 0)
      .labels({
        visible: 300,
        end: 600
      })
      .build();

    expect(composition.labels).toEqual({
      start: 0,
      visible: 300,
      end: 600
    });
  });

  it('adds a registered motion item', () => {
    const composition = new MotionCompositionBuilder()
      .motion('fade-in', {
        options: {
          fromOpacity: 0,
          toOpacity: 1
        },
        at: 100,
        defaults: {
          duration: 200
        }
      })
      .build();

    expect(composition).toEqual({
      items: [
        {
          kind: 'motion',
          type: 'fade-in',
          options: {
            fromOpacity: 0,
            toOpacity: 1
          },
          at: 100,
          defaults: {
            duration: 200
          }
        }
      ]
    });
  });

  it('adds a registered motion item with a target override', () => {
    const composition = new MotionCompositionBuilder()
      .motion('slide-in', {
        target: {
          type: 'selector',
          selector: '.card'
        },
        options: {
          direction: 'bottom',
          distance: 24,
          fade: true
        }
      })
      .build();

    expect(composition.items[0]).toEqual({
      kind: 'motion',
      type: 'slide-in',
      target: {
        type: 'selector',
        selector: '.card'
      },
      options: {
        direction: 'bottom',
        distance: 24,
        fade: true
      }
    });
  });

  it('adds a direct timeline item', () => {
    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 200,
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
    };

    const composition = new MotionCompositionBuilder()
      .timeline(timeline, {
        target: {
          type: 'selector',
          selector: '.hero'
        },
        at: 100,
        defaults: {
          duration: 250
        }
      })
      .build();

    expect(composition).toEqual({
      items: [
        {
          kind: 'timeline',
          timeline,
          target: {
            type: 'selector',
            selector: '.hero'
          },
          at: 100,
          defaults: {
            duration: 250
          }
        }
      ]
    });
  });

  it('preserves item order', () => {
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
                  opacity: 1,
                  offset: 1
                }
              ]
            }
          ]
        }
      ]
    };

    const composition = new MotionCompositionBuilder()
      .motion('fade-in')
      .timeline(timeline)
      .motion('fade-out')
      .build();

    expect(composition.items.map((item) => item.kind)).toEqual(['motion', 'timeline', 'motion']);

    expect(composition.items[0]).toMatchObject({
      kind: 'motion',
      type: 'fade-in'
    });

    expect(composition.items[2]).toMatchObject({
      kind: 'motion',
      type: 'fade-out'
    });
  });
});

describe('createMotionComposition', () => {
  it('creates a composition from a builder callback', () => {
    const composition = createMotionComposition((composition) => {
      composition.defaults({
        duration: 300,
        easing: 'ease-out'
      });

      composition.label('start', 0);

      composition.motion('fade-in', {
        at: 'start',
        options: {
          fromOpacity: 0,
          toOpacity: 1
        }
      });

      composition.motion('slide-in', {
        at: 250,
        options: {
          direction: 'bottom',
          distance: 24,
          fade: false
        }
      });
    });

    expect(composition).toEqual({
      defaults: {
        duration: 300,
        easing: 'ease-out'
      },
      labels: {
        start: 0
      },
      items: [
        {
          kind: 'motion',
          type: 'fade-in',
          at: 'start',
          options: {
            fromOpacity: 0,
            toOpacity: 1
          }
        },
        {
          kind: 'motion',
          type: 'slide-in',
          at: 250,
          options: {
            direction: 'bottom',
            distance: 24,
            fade: false
          }
        }
      ]
    });
  });

  it('returns a MotionCompositionDefinition object', () => {
    const composition = createMotionComposition((composition) => {
      composition.motion('fade-in');
    });

    expect(composition).toEqual({
      items: [
        {
          kind: 'motion',
          type: 'fade-in'
        }
      ]
    });
  });

  it('adds labels to registered motion items', () => {
    const composition = createMotionComposition((composition) => {
      composition.motion('fade-in', {
        label: 'card-enter',
        at: 100
      });
    });

    expect(composition.items[0]).toMatchObject({
      kind: 'motion',
      type: 'fade-in',
      label: 'card-enter',
      at: 100
    });
  });

  it('adds labels to direct timeline items', () => {
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

    const composition = createMotionComposition((composition) => {
      composition.timeline(timeline, {
        label: 'timeline-enter',
        at: 100
      });
    });

    expect(composition.items[0]).toMatchObject({
      kind: 'timeline',
      label: 'timeline-enter',
      at: 100
    });
  });
});
