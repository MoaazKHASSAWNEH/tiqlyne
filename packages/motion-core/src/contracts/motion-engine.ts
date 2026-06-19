import type { MotionConfig } from '../models/motion-config';
import type { MotionPlaybackResult } from '../models/motion-playback-result';

export interface MotionEngine<TTarget = unknown> {
  play(
    target: TTarget,
    config: MotionConfig
  ): Promise<MotionPlaybackResult>;
}