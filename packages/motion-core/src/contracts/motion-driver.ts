import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { ReducedMotionStrategy } from '../models/reduced-motion-strategy';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import type { MotionTriggerType } from '../models/motion-trigger';
import type { MotionConflictStrategy } from '../models/motion-conflict-strategy';
import type { MotionPlaybackController } from '../models/motion-playback-controller';
import type { MotionExecutionPlan } from '../models/motion-execution-plan';

export type MotionPlayOptions = {
  readonly trigger: MotionTriggerType;
  readonly respectReducedMotion: boolean;
  readonly reducedMotionStrategy: ReducedMotionStrategy;
  readonly reducedMotionTimeline?: MotionTimelineDefinition;
  readonly conflictStrategy: MotionConflictStrategy;

  /**
   * Complete execution plan created by the core engine.
   * Advanced drivers may use it to inspect prepared timelines,
   * scheduled tasks and execution summary.
   */
  readonly executionPlan?: MotionExecutionPlan;

  /**
   * Internal optimization flag.
   * When true, the main timeline has already been validated by the core engine.
   * Drivers may skip their own validation for this timeline.
   */
  readonly timelineValidated?: boolean;

  /**
   * Internal optimization flag.
   * When true, the reduced motion timeline has already been validated by the core engine.
   * Drivers may skip their own validation for this timeline.
   */
  readonly reducedMotionTimelineValidated?: boolean;
};

export type MotionCreatePlaybackOptions = MotionPlayOptions;

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

  createPlayback?(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options: MotionCreatePlaybackOptions
  ): MotionPlaybackController;
}
