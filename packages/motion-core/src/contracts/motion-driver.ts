import type { MotionExecutionPlan } from '../models/motion-execution-plan';
import type { MotionConflictStrategy } from '../models/motion-conflict-strategy';
import type { MotionPlaybackController } from '../models/motion-playback-controller';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import type { MotionTriggerType } from '../models/motion-trigger';
import type { ReducedMotionStrategy } from '../models/reduced-motion-strategy';

/**
 * Options passed by the core engine to a motion driver when playing a timeline.
 *
 * These options are already normalized by the engine. Drivers should treat them
 * as execution instructions and avoid mutating them.
 */
export type MotionPlayOptions = {
  /**
   * Trigger that initiated playback, such as page load, interaction or manual call.
   */
  readonly trigger: MotionTriggerType;

  /**
   * Whether the current playback should respect reduced-motion preferences.
   */
  readonly respectReducedMotion: boolean;

  /**
   * Strategy used when reduced motion should be applied.
   */
  readonly reducedMotionStrategy: ReducedMotionStrategy;

  /**
   * Optional timeline to use when reduced motion is simplified instead of skipped.
   */
  readonly reducedMotionTimeline?: MotionTimelineDefinition;

  /**
   * Strategy used when another animation is already active on the same target.
   */
  readonly conflictStrategy: MotionConflictStrategy;

  /**
   * Complete execution plan created by the core engine.
   *
   * Advanced drivers may use it to inspect prepared timelines, scheduled tasks
   * and execution summary.
   */
  readonly executionPlan?: MotionExecutionPlan;

  /**
   * Internal optimization flag.
   *
   * When true, the main timeline has already been validated by the core engine.
   * Drivers may skip their own validation for this timeline.
   */
  readonly timelineValidated?: boolean;

  /**
   * Internal optimization flag.
   *
   * When true, the reduced motion timeline has already been validated by the core engine.
   * Drivers may skip their own validation for this timeline.
   */
  readonly reducedMotionTimelineValidated?: boolean;
};

/**
 * Options passed when a driver creates a controllable playback.
 *
 * This currently mirrors {@link MotionPlayOptions}, but is kept as a separate
 * alias to allow the controller creation API to evolve independently later.
 */
export type MotionCreatePlaybackOptions = MotionPlayOptions;

/**
 * Platform adapter responsible for executing timelines.
 *
 * The core package does not directly depend on the DOM, Web Animations API,
 * canvas, native runtimes or test environments. A driver translates prepared
 * timelines into concrete playback operations for one target type.
 *
 * @typeParam TTarget - Target type supported by the driver.
 */
export interface MotionDriver<TTarget = unknown> {
  /**
   * Human-readable driver name used in diagnostics and debugging.
   */
  readonly name: string;

  /**
   * Plays a timeline on a target.
   *
   * @param target - Runtime target accepted by the driver.
   * @param timeline - Timeline prepared by the engine.
   * @param options - Normalized playback options.
   * @returns Playback result.
   */
  play(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult>;

  /**
   * Cancels active animations for a target when supported.
   *
   * @param target - Runtime target accepted by the driver.
   * @returns Cancellation result.
   */
  cancel?(target: TTarget): Promise<MotionPlaybackResult>;

  /**
   * Finishes active animations for a target when supported.
   *
   * @param target - Runtime target accepted by the driver.
   * @returns Finish result.
   */
  finish?(target: TTarget): Promise<MotionPlaybackResult>;

  /**
   * Resets animation state for a target when supported.
   *
   * @param target - Runtime target accepted by the driver.
   * @returns Reset result.
   */
  reset?(target: TTarget): Promise<MotionPlaybackResult>;

  /**
   * Creates a controllable playback when the driver supports runtime controls.
   *
   * Drivers that do not implement this method will still work: the engine falls
   * back to a promise-based controller.
   *
   * @param target - Runtime target accepted by the driver.
   * @param timeline - Timeline prepared by the engine.
   * @param options - Normalized playback options.
   * @returns Playback controller.
   */
  createPlayback?(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options: MotionCreatePlaybackOptions
  ): MotionPlaybackController;
}
