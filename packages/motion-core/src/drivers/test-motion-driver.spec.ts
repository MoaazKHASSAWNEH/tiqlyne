import { describe, expect, it } from 'vitest';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { TestMotionDriver } from './test-motion-driver';

describe('TestMotionDriver', () => {
  it('records play calls and returns a finished result', async () => {
    const driver = new TestMotionDriver<string>();

    const timeline: MotionTimelineDefinition = {
      tracks: []
    };

    const result = await driver.play('target-1', timeline, {
      trigger: 'onClick',
      respectReducedMotion: false
    });

    expect(result).toEqual({
      status: 'finished'
    });

    expect(driver.getCalls()).toEqual([
      {
        target: 'target-1',
        timeline,
        options: {
          trigger: 'onClick',
          respectReducedMotion: false
        }
      }
    ]);
  });

  it('clears recorded calls', async () => {
    const driver = new TestMotionDriver<string>();

    await driver.play(
      'target-1',
      {
        tracks: []
      },
      {
        trigger: 'onEnter',
        respectReducedMotion: true
      }
    );

    expect(driver.getCalls()).toHaveLength(1);

    driver.clear();

    expect(driver.getCalls()).toHaveLength(0);
  });

  it('has a stable driver name', () => {
    const driver = new TestMotionDriver();

    expect(driver.name).toBe('test');
  });
});