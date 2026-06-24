import { describe, expect, it } from 'vitest';
import { toWebKeyframes } from './to-web-keyframes';

describe('toWebKeyframes', () => {
  it('converts motion keyframes to web keyframes', () => {
    const result = toWebKeyframes([
      {
        opacity: 0,
        transform: 'translateY(24px)',
        offset: 0
      },
      {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
        offset: 1
      }
    ]);

    expect(result).toEqual([
      {
        opacity: 0,
        transform: 'translateY(24px)',
        offset: 0
      },
      {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
        offset: 1
      }
    ]);
  });

  it('copies custom properties', () => {
    const result = toWebKeyframes([
      {
        custom: {
          scale: 1,
          '--motion-progress': 0
        }
      }
    ]);

    expect(result).toEqual([
      {
        scale: 1,
        '--motion-progress': 0
      }
    ]);
  });

  it('converts structured transforms to web transform strings', () => {
    const result = toWebKeyframes([
      {
        transform: {
          x: 24,
          y: '10%',
          scale: 0.95,
          rotate: -4,
          origin: 'top center'
        }
      }
    ]);

    expect(result).toEqual([
      {
        transform: 'translateX(24px) translateY(10%) scale(0.95) rotate(-4deg)',
        transformOrigin: 'top center'
      }
    ]);
  });
});
