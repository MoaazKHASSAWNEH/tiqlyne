import { describe, expect, it } from 'vitest';
import type { MotionConfig } from '../models/motion-config';
import { DefaultMotionConfigNormalizer } from './default-motion-config-normalizer';

describe('DefaultMotionConfigNormalizer', () => {
  it('normalizes a minimal motion config with default values', () => {
    const normalizer = new DefaultMotionConfigNormalizer();

    const result = normalizer.normalize({
      id: 'motion_001',
      type: 'fade-in',
      trigger: 'onEnter'
    });

    expect(result).toEqual({
      id: 'motion_001',
      type: 'fade-in',
      trigger: 'onEnter',
      enabled: true,
      duration: 300,
      delay: 0,
      easing: 'ease',
      options: {},
      respectReducedMotion: true,
      reducedMotionStrategy: 'skip',
      conflictStrategy: 'replace',
      priority: 0,
      metadata: {}
    });
  });

  it('keeps valid values', () => {
    const normalizer = new DefaultMotionConfigNormalizer();

    const result = normalizer.normalize({
      id: 'motion_002',
      type: 'slide-in',
      trigger: 'onClick',
      enabled: false,
      duration: 450,
      delay: 120,
      easing: 'ease-out',
      options: {
        direction: 'right',
        distance: 32
      },
      respectReducedMotion: false,
      reducedMotionStrategy: 'simplify',
      conflictStrategy: 'parallel',
      priority: 10,
      metadata: {
        source: 'builder'
      }
    });

    expect(result).toEqual({
      id: 'motion_002',
      type: 'slide-in',
      trigger: 'onClick',
      enabled: false,
      duration: 450,
      delay: 120,
      easing: 'ease-out',
      options: {
        direction: 'right',
        distance: 32
      },
      respectReducedMotion: false,
      reducedMotionStrategy: 'simplify',
      conflictStrategy: 'parallel',
      priority: 10,
      metadata: {
        source: 'builder'
      }
    });
  });

  it('clamps duration and delay', () => {
    const normalizer = new DefaultMotionConfigNormalizer();

    const result = normalizer.normalize({
      id: 'motion_003',
      type: 'fade-in',
      trigger: 'onEnter',
      duration: 999999,
      delay: -100
    });

    expect(result.duration).toBe(5000);
    expect(result.delay).toBe(0);
  });

  it('uses fallback values for invalid optional fields', () => {
    const normalizer = new DefaultMotionConfigNormalizer();

    const result = normalizer.normalize({
      id: 'motion_004',
      type: 'fade-in',
      trigger: 'onEnter',
      duration: Number.NaN,
      delay: Number.POSITIVE_INFINITY,
      easing: '',
      options: [] as unknown as Record<string, unknown>,
      metadata: [] as unknown as Record<string, unknown>,
      reducedMotionStrategy: 'invalid' as never,
      conflictStrategy: 'invalid' as never
    });

    expect(result.duration).toBe(300);
    expect(result.delay).toBe(0);
    expect(result.easing).toBe('ease');
    expect(result.options).toEqual({});
    expect(result.metadata).toEqual({});
    expect(result.reducedMotionStrategy).toBe('skip');
    expect(result.conflictStrategy).toBe('replace');
  });

  it('rounds priority to an integer', () => {
    const normalizer = new DefaultMotionConfigNormalizer();

    const result = normalizer.normalize({
      id: 'motion_005',
      type: 'shake',
      trigger: 'manual',
      priority: 4.7
    });

    expect(result.priority).toBe(5);
  });

  it('normalizes invalid trigger to onEnter', () => {
    const normalizer = new DefaultMotionConfigNormalizer();

    const config = normalizer.normalize({
      id: 'motion_006',
      type: 'fade-in',
      trigger: 'invalid-trigger'
    } as unknown as MotionConfig);

    expect(config.trigger).toBe('onEnter');
  });
});
