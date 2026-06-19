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
});
