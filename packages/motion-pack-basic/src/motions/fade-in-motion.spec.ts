import { describe, expect, it } from 'vitest';
import { FadeInMotion } from './fade-in-motion';

describe('FadeInMotion', () => {
  it('exposes stable metadata', () => {
    const motion = new FadeInMotion();

    expect(motion.type).toBe('fade-in');
    expect(motion.label).toBe('Fade in');
    expect(motion.category).toBe('entrance');
    expect(motion.optionDefinitions).toHaveLength(2);
  });

  it('returns default options', () => {
    const motion = new FadeInMotion();

    expect(motion.getDefaultOptions()).toEqual({
      fromOpacity: 0,
      toOpacity: 1
    });
  });

  it('normalizes invalid options using fallback values', () => {
    const motion = new FadeInMotion();

    const result = motion.normalizeOptions({
      fromOpacity: 'invalid',
      toOpacity: null
    });

    expect(result).toEqual({
      fromOpacity: 0,
      toOpacity: 1
    });
  });

  it('clamps opacity options between 0 and 1', () => {
    const motion = new FadeInMotion();

    const result = motion.normalizeOptions({
      fromOpacity: -10,
      toOpacity: 10
    });

    expect(result).toEqual({
      fromOpacity: 0,
      toOpacity: 1
    });
  });

  it('validates that fromOpacity and toOpacity are different', () => {
    const motion = new FadeInMotion();

    const result = motion.validateOptions({
      fromOpacity: 1,
      toOpacity: 1
    });

    expect(result).toEqual(['fromOpacity and toOpacity must be different']);
  });

  it('builds a valid fade-in timeline', () => {
    const motion = new FadeInMotion();

    const timeline = motion.buildTimeline({
      options: {
        fromOpacity: 0,
        toOpacity: 1
      },
      duration: 300,
      delay: 50,
      easing: 'ease-out',
      trigger: 'onEnter'
    });

    expect(timeline).toEqual({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              delay: 50,
              easing: 'ease-out',
              fill: 'both',
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
