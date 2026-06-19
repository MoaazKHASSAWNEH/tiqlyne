import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { ReducedMotionStrategy } from '../models/reduced-motion-strategy';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

export type MotionPlayOptions = {
  readonly trigger: string;
  readonly respectReducedMotion: boolean;
  readonly reducedMotionStrategy: ReducedMotionStrategy;
  readonly reducedMotionTimeline?: MotionTimelineDefinition;
};

export interface MotionDriver<TTarget = unknown> {
  readonly name: string;

  play(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult>;

  cancel?(target: TTarget): Promise<MotionPlaybackResult>;

  finish?(target: TTarget): Promise<MotionPlaybackResult>;

  reset?(target: TTarget): Promise<MotionPlaybackResult>;
}
