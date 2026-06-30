import type { MotionDriver, MotionPlayOptions } from '../contracts/motion-driver';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import { MotionPlaybackResultReasons } from '../models/motion-playback-result-reason';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

export class NoopMotionDriver<TTarget = unknown> implements MotionDriver<TTarget> {
  readonly name = 'noop';

  async play(
    _target: TTarget,
    _timeline: MotionTimelineDefinition,
    _options: MotionPlayOptions
  ): Promise<MotionPlaybackResult> {
    return {
      status: 'skipped',
      reason: MotionPlaybackResultReasons.NoopDriver
    };
  }

  async cancel(_target: TTarget): Promise<MotionPlaybackResult> {
    return {
      status: 'skipped',
      reason: MotionPlaybackResultReasons.NoopDriver
    };
  }

  async finish(_target: TTarget): Promise<MotionPlaybackResult> {
    return {
      status: 'skipped',
      reason: MotionPlaybackResultReasons.NoopDriver
    };
  }

  async reset(_target: TTarget): Promise<MotionPlaybackResult> {
    return {
      status: 'skipped',
      reason: MotionPlaybackResultReasons.NoopDriver
    };
  }
}
