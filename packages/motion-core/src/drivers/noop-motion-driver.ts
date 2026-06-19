import type {
  MotionDriver,
  MotionPlayOptions
} from '../contracts/motion-driver';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
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
      reason: 'noop-driver'
    };
  }
}