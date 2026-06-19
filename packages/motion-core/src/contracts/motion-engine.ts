import type { MotionConfig } from '../models/motion-config';
import type { MotionPlaybackResult } from '../models/motion-playback-result';

export interface MotionEngine<TTarget = unknown> {
  play(target: TTarget, config: MotionConfig): Promise<MotionPlaybackResult>;

  cancel(target: TTarget): Promise<MotionPlaybackResult>;

  finish(target: TTarget): Promise<MotionPlaybackResult>;

  reset(target: TTarget): Promise<MotionPlaybackResult>;
}
