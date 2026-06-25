import { describe, expect, it } from 'vitest';
import { getMotionKeyframePropertyPerformanceTier } from './motion-performance-tier';

describe('getMotionKeyframePropertyPerformanceTier', () => {
  it('classifies compositor-friendly properties', () => {
    expect(getMotionKeyframePropertyPerformanceTier('opacity')).toBe('compositor');
    expect(getMotionKeyframePropertyPerformanceTier('transform')).toBe('compositor');
  });

  it('classifies paint properties', () => {
    expect(getMotionKeyframePropertyPerformanceTier('filter')).toBe('paint');
    expect(getMotionKeyframePropertyPerformanceTier('boxShadow')).toBe('paint');
    expect(getMotionKeyframePropertyPerformanceTier('backgroundColor')).toBe('paint');
    expect(getMotionKeyframePropertyPerformanceTier('color')).toBe('paint');
    expect(getMotionKeyframePropertyPerformanceTier('borderColor')).toBe('paint');
    expect(getMotionKeyframePropertyPerformanceTier('outlineColor')).toBe('paint');
  });

  it('classifies unknown properties', () => {
    expect(getMotionKeyframePropertyPerformanceTier('customProperty')).toBe('unknown');
  });
});
