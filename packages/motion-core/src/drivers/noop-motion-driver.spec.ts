import { describe, expect, it } from 'vitest';
import { NoopMotionDriver } from './noop-motion-driver';

describe('NoopMotionDriver', () => {
  it('returns a skipped result', async () => {
    const driver = new NoopMotionDriver();

    const result = await driver.play(
      {},
      {
        tracks: []
      },
      {
        trigger: 'onEnter',
        respectReducedMotion: true,
        reducedMotionStrategy: 'skip'
      }
    );

    expect(result).toEqual({
      status: 'skipped',
      reason: 'noop-driver'
    });
  });

  it('has a stable driver name', () => {
    const driver = new NoopMotionDriver();

    expect(driver.name).toBe('noop');
  });
});
