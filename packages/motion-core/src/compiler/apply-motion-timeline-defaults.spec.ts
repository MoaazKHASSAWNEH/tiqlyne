import { describe, expect, it } from 'vitest';
import {
  applyMotionStepDefaults,
  applyMotionTimelineDefaults,
  hasMotionTimelineDefaults,
  mergeMotionTimelineDefaults
} from './apply-motion-timeline-defaults';
import type { MotionStepDefinition, MotionTimelineDefinition } from '../models/motion-timeline';

describe('applyMotionTimelineDefaults', () => {
  it('returns the same timeline when no defaults are defined', () => {
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
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    };

    expect(applyMotionTimelineDefaults(timeline)).toBe(timeline);
  });

  it('applies timeline defaults to steps', () => {
    const timeline = applyMotionTimelineDefaults({
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
    });

    expect(timeline.tracks[0]?.steps[0]).toMatchObject({
      duration: 300,
      delay: 50,
      easing: 'ease-out',
      fill: 'both'
    });
  });

  it('applies playback timing defaults to steps', () => {
    const timeline = applyMotionTimelineDefaults({
      defaults: {
        duration: 300,
        iterations: 2,
        direction: 'alternate',
        endDelay: 100
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
    });

    expect(timeline.tracks[0]?.steps[0]).toMatchObject({
      duration: 300,
      iterations: 2,
      direction: 'alternate',
      endDelay: 100
    });
  });

  it('does not override step values with timeline defaults', () => {
    const timeline = applyMotionTimelineDefaults({
      defaults: {
        duration: 300,
        delay: 50,
        easing: 'ease-out',
        fill: 'both',
        iterations: 2,
        direction: 'alternate',
        endDelay: 100
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 500,
              delay: 25,
              easing: 'linear',
              fill: 'forwards',
              iterations: 3,
              direction: 'reverse',
              endDelay: 200,
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

    expect(timeline.tracks[0]?.steps[0]).toMatchObject({
      duration: 500,
      delay: 25,
      easing: 'linear',
      fill: 'forwards',
      iterations: 3,
      direction: 'reverse',
      endDelay: 200
    });
  });

  it('lets track defaults override timeline defaults', () => {
    const timeline = applyMotionTimelineDefaults({
      defaults: {
        duration: 300,
        delay: 50,
        easing: 'ease-out',
        fill: 'both',
        iterations: 2,
        direction: 'alternate',
        endDelay: 100
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          defaults: {
            duration: 500,
            delay: 75,
            easing: 'linear',
            fill: 'forwards',
            iterations: 3,
            direction: 'reverse',
            endDelay: 200
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
    });

    expect(timeline.tracks[0]?.steps[0]).toMatchObject({
      duration: 500,
      delay: 75,
      easing: 'linear',
      fill: 'forwards',
      iterations: 3,
      direction: 'reverse',
      endDelay: 200
    });
  });

  it('keeps unchanged tracks by reference when defaults do not affect their steps', () => {
    const track = {
      target: {
        type: 'self' as const
      },
      steps: [
        {
          duration: 300,
          keyframes: [
            {
              opacity: 1
            }
          ]
        }
      ]
    };

    const timeline: MotionTimelineDefinition = {
      tracks: [track]
    };

    const resolved = applyMotionTimelineDefaults(timeline);

    expect(resolved).toBe(timeline);
    expect(resolved.tracks[0]).toBe(track);
  });
});

describe('applyMotionStepDefaults', () => {
  it('returns the same step when defaults do not add values', () => {
    const step: MotionStepDefinition = {
      duration: 300,
      keyframes: [
        {
          opacity: 1
        }
      ]
    };

    expect(applyMotionStepDefaults(step, {})).toBe(step);
  });

  it('applies missing defaults to a step', () => {
    const step: MotionStepDefinition = {
      keyframes: [
        {
          opacity: 1
        }
      ]
    };

    expect(
      applyMotionStepDefaults(step, {
        duration: 300,
        delay: 50,
        easing: 'ease-out',
        fill: 'both',
        iterations: 2,
        direction: 'alternate',
        endDelay: 100
      })
    ).toMatchObject({
      duration: 300,
      delay: 50,
      easing: 'ease-out',
      fill: 'both',
      iterations: 2,
      direction: 'alternate',
      endDelay: 100
    });
  });

  it('does not override existing step values', () => {
    const step: MotionStepDefinition = {
      duration: 500,
      delay: 25,
      easing: 'linear',
      fill: 'forwards',
      iterations: 3,
      direction: 'reverse',
      endDelay: 200,
      keyframes: [
        {
          opacity: 1
        }
      ]
    };

    expect(
      applyMotionStepDefaults(step, {
        duration: 300,
        delay: 50,
        easing: 'ease-out',
        fill: 'both',
        iterations: 2,
        direction: 'alternate',
        endDelay: 100
      })
    ).toMatchObject({
      duration: 500,
      delay: 25,
      easing: 'linear',
      fill: 'forwards',
      iterations: 3,
      direction: 'reverse',
      endDelay: 200
    });
  });
});

describe('mergeMotionTimelineDefaults', () => {
  it('merges timeline and track defaults', () => {
    expect(
      mergeMotionTimelineDefaults(
        {
          duration: 300,
          delay: 50,
          easing: 'ease-out',
          fill: 'both',
          iterations: 2,
          direction: 'alternate',
          endDelay: 100
        },
        {
          duration: 500,
          direction: 'reverse'
        }
      )
    ).toEqual({
      duration: 500,
      delay: 50,
      easing: 'ease-out',
      fill: 'both',
      iterations: 2,
      direction: 'reverse',
      endDelay: 100
    });
  });

  it('returns an empty object when no defaults are provided', () => {
    expect(mergeMotionTimelineDefaults(undefined, undefined)).toEqual({});
  });
});

describe('hasMotionTimelineDefaults', () => {
  it('returns false when defaults are empty', () => {
    expect(hasMotionTimelineDefaults({})).toBe(false);
  });

  it('returns true when duration default is defined', () => {
    expect(
      hasMotionTimelineDefaults({
        duration: 300
      })
    ).toBe(true);
  });

  it('returns true when playback timing defaults are defined', () => {
    expect(
      hasMotionTimelineDefaults({
        iterations: 2,
        direction: 'alternate',
        endDelay: 100
      })
    ).toBe(true);
  });
});
