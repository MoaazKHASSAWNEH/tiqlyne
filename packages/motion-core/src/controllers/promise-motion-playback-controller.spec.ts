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

  it('skips seekProgress because generic promise playback does not support progress control', async () => {
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

    const result = await controller.seekProgress(0.5);

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'playback-seek-progress-not-supported'
    });
  });

  it('skips seekProgress when progress is invalid', async () => {
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

    const result = await controller.seekProgress(Number.NaN);

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'playback-seek-progress-invalid-progress'
    });
  });

  it('skips jumpToLabel because generic promise playback does not support labels', async () => {
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

    const result = await controller.jumpToLabel('intro');

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'playback-jump-to-label-not-supported'
    });
  });

  it('skips jumpToLabel when label is empty', async () => {
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

    const result = await controller.jumpToLabel('   ');

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'playback-jump-to-label-invalid-label'
    });
  });

  it('skips playForward because generic promise playback does not support direction control', async () => {
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

    const result = await controller.playForward();

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'playback-play-forward-not-supported'
    });
  });

  it('skips playBackward because generic promise playback does not support direction control', async () => {
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

    const result = await controller.playBackward();

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'playback-play-backward-not-supported'
    });
  });

  it('skips setPlaybackRate because generic promise playback does not support rate control', async () => {
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

    const result = await controller.setPlaybackRate(2);

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'playback-set-playback-rate-not-supported'
    });
  });

  it('skips setPlaybackRate when rate is invalid', async () => {
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

    const result = await controller.setPlaybackRate(0);

    expect(result).toMatchObject({
      status: 'skipped',
      reason: 'playback-set-playback-rate-invalid-rate'
    });
  });
});
