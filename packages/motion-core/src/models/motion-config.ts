import type { MotionConflictStrategy } from './motion-conflict-strategy';
import type { MotionEasing } from './motion-easing';
import type { MotionTriggerType } from './motion-trigger';
import type { ReducedMotionStrategy } from './reduced-motion-strategy';

/**
 * User-facing motion configuration.
 *
 * This is the object typically stored as JSON in a database, returned by an API
 * or produced by a builder. It is intentionally permissive: optional values are
 * normalized by the engine before planning and playback.
 */
export type MotionConfig = {
  /**
   * Stable motion config identifier.
   */
  readonly id: string;

  /**
   * Registered motion type to play.
   */
  readonly type: string;

  /**
   * Trigger associated with this motion.
   */
  readonly trigger?: MotionTriggerType;

  /**
   * Whether this motion is enabled.
   */
  readonly enabled?: boolean;

  /**
   * Desired duration in milliseconds.
   */
  readonly duration?: number;

  /**
   * Desired delay in milliseconds.
   */
  readonly delay?: number;

  /**
   * Desired easing.
   */
  readonly easing?: MotionEasing;

  /**
   * Raw options passed to the registered motion definition.
   *
   * The motion definition is responsible for normalizing these options into its
   * strongly typed option model.
   */
  readonly options?: Record<string, unknown>;

  /**
   * Whether playback should respect reduced-motion preferences.
   */
  readonly respectReducedMotion?: boolean;

  /**
   * Strategy used when reduced motion should be applied.
   */
  readonly reducedMotionStrategy?: ReducedMotionStrategy;

  /**
   * Strategy used when another animation is already active on the same target.
   */
  readonly conflictStrategy?: MotionConflictStrategy;

  /**
   * Priority used by orchestration layers when several motions match a trigger.
   */
  readonly priority?: number;

  /**
   * Extra application metadata.
   *
   * The core does not interpret metadata directly, but it can be useful for
   * builders, migrations, analytics or project-specific runtime logic.
   */
  readonly metadata?: Record<string, unknown>;
};
