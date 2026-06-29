import { describe, expect, it } from 'vitest';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import { PromiseMotionPlaybackController } from './promise-motion-playback-controller';

describe('PromiseMotionPlaybackController', () => {
  it('returns a generic running playback state', () => {
    const controller = new PromiseMotionPlaybackController(
      'playback-1',
      new Promise<MotionPlaybackResult>(() => {}),
      async () => ({
        status: 'cancelled'
      }),
      async () => ({
        status: 'finished'
      })
    );

    expect(controller.getState()).toEqual({
      status: 'running',
      currentTime: null,
      duration: null,
      progress: null,
      playbackRate: 1,
      direction: 'forward',
      activeTrackIndexes: [],
      activeStepIndexes: []
    });
  });

  it('returns the updated status after cancel', async () => {
    const controller = new PromiseMotionPlaybackController(
      'playback-1',
      new Promise<MotionPlaybackResult>(() => {}),
      async () => ({
        status: 'cancelled',
        reason: 'test-cancel'
      }),
      async () => ({
        status: 'finished'
      })
    );

    await controller.cancel();

    expect(controller.getState().status).toBe('cancelled');
  });

  it('returns the updated status after finish', async () => {
    const controller = new PromiseMotionPlaybackController(
      'playback-1',
      new Promise<MotionPlaybackResult>(() => {}),
      async () => ({
        status: 'cancelled'
      }),
      async () => ({
        status: 'finished',
        reason: 'test-finish'
      })
    );

    await controller.finish();

    expect(controller.getState().status).toBe('finished');
  });

  it('skips seek because generic promise playback does not support time control', async () => {
    const controller = new PromiseMotionPlaybackController(
      'playback-1',
      new Promise<MotionPlaybackResult>(() => {}),
      async () => ({
        status: 'cancelled'
      }),
      async () => ({
        status: 'finished'
      })
    );

    const result = await controller.seek(100);

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'playback-seek-not-supported'
    });
  });

  it('skips seek when time is invalid', async () => {
    const controller = new PromiseMotionPlaybackController(
      'playback-1',
      new Promise<MotionPlaybackResult>(() => {}),
      async () => ({
        status: 'cancelled'
      }),
      async () => ({
        status: 'finished'
      })
    );

    const result = await controller.seek(Number.NaN);

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'playback-seek-invalid-time'
    });
  });
});
