import { describe, expect, it } from 'vitest';
import type { MotionPlaybackControllerStatus } from '../models/motion-playback-controller';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { MotionPlaybackState } from '../models/motion-playback-state';
import { BaseMotionPlaybackController } from './base-motion-playback-controller';

class TestPlaybackController extends BaseMotionPlaybackController {
  readonly id = 'test-playback';
  readonly status: MotionPlaybackControllerStatus = 'running';

  emitTestEvent(result: MotionPlaybackResult, state: MotionPlaybackState): void {
    this.emitPlaybackEvent('seek', 'running', 'running', result, state);
  }
}

describe('BaseMotionPlaybackController', () => {
  it('emits playback events with state snapshots', () => {
    const controller = new TestPlaybackController();

    const result: MotionPlaybackResult = {
      status: 'running',
      reason: 'test-seek'
    };

    const state: MotionPlaybackState = {
      status: 'running',
      currentTime: 100,
      duration: 1000,
      progress: 0.1,
      playbackRate: 1,
      direction: 'forward',
      activeTrackIndexes: [0],
      activeStepIndexes: [1]
    };

    const events: unknown[] = [];

    controller.on('seek', (event) => {
      events.push(event);
    });

    controller.emitTestEvent(result, state);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: 'seek',
      playbackId: 'test-playback',
      status: 'running',
      previousStatus: 'running',
      result,
      state
    });
  });
});
