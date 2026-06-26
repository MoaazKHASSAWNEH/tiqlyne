import type { MotionConfig } from '../models/motion-config';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { MotionPlaybackController } from '../models/motion-playback-controller';
import type { MotionExecutionPlan } from '../models/motion-execution-plan';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import type { MotionTimelinePlayOptions } from '../models/motion-timeline-play-options';

export interface MotionEngine<TTarget = unknown> {
  play(target: TTarget, config: MotionConfig): Promise<MotionPlaybackResult>;

  playTimeline(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): Promise<MotionPlaybackResult>;

  cancel(target: TTarget): Promise<MotionPlaybackResult>;

  finish(target: TTarget): Promise<MotionPlaybackResult>;

  reset(target: TTarget): Promise<MotionPlaybackResult>;

  createPlayback(target: TTarget, config: MotionConfig): MotionPlaybackController;

  createTimelinePlayback(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionPlaybackController;

  plan(config: MotionConfig): MotionExecutionPlan;

  planTimeline(
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionExecutionPlan;
}
