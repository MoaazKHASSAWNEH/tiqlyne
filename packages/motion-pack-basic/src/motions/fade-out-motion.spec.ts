import { describe, expect, it } from 'vitest';
import { FadeOutMotion } from './fade-out-motion';

describe('FadeOutMotion', () => {
  it('exposes stable metadata', () => {
    const motion = new FadeOutMotion();

    expect(motion.type).toBe('fade-out');
    expect(motion.label).toBe('Fade out');
    expect(motion.category).toBe('exit');
    expect(motion.optionDefinitions).toHaveLength(2);
  });

  it('returns default options', () => {
    const motion = new FadeOutMotion();

    expect(motion.getDefaultOptions()).toEqual({
      fromOpacity: 1,
      toOpacity: 0
    });
  });

  it('normalizes invalid options using fallback values', () => {
    const motion = new FadeOutMotion();

    const result = motion.normalizeOptions({
      fromOpacity: 'invalid',
      toOpacity: null
    });

    expect(result).toEqual({
      fromOpacity: 1,
      toOpacity: 0
    });
  });

  it('clamps opacity options between 0 and 1', () => {
    const motion = new FadeOutMotion();

    const result = motion.normalizeOptions({
      fromOpacity: 10,
      toOpacity: -10
    });

    expect(result).toEqual({
      fromOpacity: 1,
      toOpacity: 0
    });
  });

  it('validates that fromOpacity and toOpacity are different', () => {
    const motion = new FadeOutMotion();

    const result = motion.validateOptions({
      fromOpacity: 0,
      toOpacity: 0
    });

    expect(result).toEqual(['fromOpacity and toOpacity must be different']);
  });

  it('builds a valid fade-out timeline', () => {
    const motion = new FadeOutMotion();

    const timeline = motion.buildTimeline({
      options: {
        fromOpacity: 1,
        toOpacity: 0
      },
      duration: 250,
      delay: 30,
      easing: 'ease-in',
      trigger: 'onExit'
    });

    expect(timeline).toEqual({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 250,
              delay: 30,
              easing: 'ease-in',
              fill: 'both',
              keyframes: [
                {
                  opacity: 1,
                  offset: 0
                },
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
});