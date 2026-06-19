import { describe, expect, it } from 'vitest';
import { SlideInMotion } from './slide-in-motion';

describe('SlideInMotion', () => {
  it('exposes stable metadata', () => {
    const motion = new SlideInMotion();

    expect(motion.type).toBe('slide-in');
    expect(motion.label).toBe('Slide in');
    expect(motion.category).toBe('entrance');
    expect(motion.optionDefinitions).toHaveLength(3);
  });

  it('returns default options', () => {
    const motion = new SlideInMotion();

    expect(motion.getDefaultOptions()).toEqual({
      direction: 'bottom',
      distance: 24,
      fade: true
    });
  });

  it('normalizes invalid options using fallback values', () => {
    const motion = new SlideInMotion();

    const result = motion.normalizeOptions({
      direction: 'invalid',
      distance: 'bad-value',
      fade: 'yes'
    });

    expect(result).toEqual({
      direction: 'bottom',
      distance: 24,
      fade: true
    });
  });

  it('clamps distance between 0 and 300', () => {
    const motion = new SlideInMotion();

    expect(
      motion.normalizeOptions({
        distance: -10
      }).distance
    ).toBe(0);

    expect(
      motion.normalizeOptions({
        distance: 999
      }).distance
    ).toBe(300);
  });

  it('builds a slide-in timeline from bottom with fade', () => {
    const motion = new SlideInMotion();

    const timeline = motion.buildTimeline({
      options: {
        direction: 'bottom',
        distance: 32,
        fade: true
      },
      duration: 300,
      delay: 20,
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
              delay: 20,
              easing: 'ease-out',
              fill: 'both',
              keyframes: [
                {
                  transform: 'translateY(32px)',
                  opacity: 0,
                  offset: 0
                },
                {
                  transform: 'translate3d(0, 0, 0)',
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

  it('builds a slide-in timeline from left without fade', () => {
    const motion = new SlideInMotion();

    const timeline = motion.buildTimeline({
      options: {
        direction: 'left',
        distance: 48,
        fade: false
      },
      duration: 300,
      delay: 0,
      easing: 'ease',
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
              delay: 0,
              easing: 'ease',
              fill: 'both',
              keyframes: [
                {
                  transform: 'translateX(-48px)',
                  opacity: undefined,
                  offset: 0
                },
                {
                  transform: 'translate3d(0, 0, 0)',
                  opacity: undefined,
                  offset: 1
                }
              ]
            }
          ]
        }
      ]
    });
  });

  it('builds a reduced motion timeline without transform', () => {
    const motion = new SlideInMotion();

    const timeline = motion.buildReducedMotionTimeline({
      options: {
        direction: 'bottom',
        distance: 56,
        fade: true
      },
      duration: 500,
      delay: 120,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      trigger: 'onClick'
    });

    expect(timeline).toEqual({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 150,
              delay: 0,
              easing: 'ease-out',
              fill: 'both',
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
    });
  });
});
