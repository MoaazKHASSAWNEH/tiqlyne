import type { MotionConfig } from '../models/motion-config';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { MotionPlaybackController } from '../models/motion-playback-controller';
import type { MotionExecutionPlan } from '../models/motion-execution-plan';

export interface MotionEngine<TTarget = unknown> {
  play(target: TTarget, config: MotionConfig): Promise<MotionPlaybackResult>;

  cancel(target: TTarget): Promise<MotionPlaybackResult>;

  finish(target: TTarget): Promise<MotionPlaybackResult>;

  reset(target: TTarget): Promise<MotionPlaybackResult>;

  createPlayback(target: TTarget, config: MotionConfig): MotionPlaybackController;

  plan(config: MotionConfig): MotionExecutionPlan;
}
