import {
  DefaultMotionConfigNormalizer,
  DefaultMotionEngine,
  DefaultMotionRegistry,
  TestMotionDriver
} from '@structifyx/motion-core';
import { describe, expect, it } from 'vitest';
import { registerBasicMotions } from './register-basic-motions';

describe('registerBasicMotions', () => {
  it('registers basic motions into the registry', () => {
    const registry = new DefaultMotionRegistry();

    registerBasicMotions(registry);

    expect(registry.has('fade-in')).toBe(true);
    expect(registry.has('fade-out')).toBe(true);
    expect(registry.has('slide-in')).toBe(true);

    expect(registry.getAll().map((motion) => motion.type)).toEqual([
      'fade-in',
      'fade-out',
      'slide-in'
    ]);
  });

  it('allows the engine to play fade-in motion', async () => {
    const registry = new DefaultMotionRegistry();
    const driver = new TestMotionDriver<string>();
    const normalizer = new DefaultMotionConfigNormalizer();

    registerBasicMotions(registry);

    const engine = new DefaultMotionEngine<string>({
      registry,
      driver,
      normalizer
    });

    const result = await engine.play('target-1', {
      id: 'motion_001',
      type: 'fade-in',
      trigger: 'onEnter',
      duration: 250,
      delay: 20,
      easing: 'ease-out',
      options: {
        fromOpacity: 0,
        toOpacity: 1
      }
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(driver.getCalls()).toHaveLength(1);
    expect(driver.getCalls()[0]?.timeline.tracks[0]?.steps[0]?.keyframes).toEqual([
      {
        opacity: 0,
        offset: 0
      },
      {
        opacity: 1,
        offset: 1
      }
    ]);
  });
});
