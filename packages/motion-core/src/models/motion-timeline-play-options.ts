import type { MotionConflictStrategy } from './motion-conflict-strategy';
import type { MotionTimelineDefinition } from './motion-timeline';
import type { MotionTriggerType } from './motion-trigger';
import type { MotionValidationOptions } from './motion-validation-options';
import type { ReducedMotionStrategy } from './reduced-motion-strategy';

/**
 * Options used when playing or planning a direct timeline.
 *
 * These options are useful for advanced users who bypass registered motion
 * definitions and provide timelines directly.
 */
export type MotionTimelinePlayOptions = {
  /**
   * Trigger associated with this direct timeline playback.
   */
  readonly trigger?: MotionTriggerType;

  /**
   * Whether playback should respect reduced-motion preferences.
   */
  readonly respectReducedMotion?: boolean;

  /**
   * Strategy used when reduced motion should be applied.
   */
  readonly reducedMotionStrategy?: ReducedMotionStrategy;

  /**
   * Optional reduced-motion timeline used when the strategy is `simplify`.
   */
  readonly reducedMotionTimeline?: MotionTimelineDefinition;

  /**
   * Strategy used when another animation is already active on the same target.
   */
  readonly conflictStrategy?: MotionConflictStrategy;

  /**
   * Optional validation options for this timeline.
   */
  readonly validation?: MotionValidationOptions;
};
