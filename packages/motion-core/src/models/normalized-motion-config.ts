import type { MotionConflictStrategy } from './motion-conflict-strategy';
import type { MotionEasing } from './motion-easing';
import type { MotionTriggerType } from './motion-trigger';
import type { ReducedMotionStrategy } from './reduced-motion-strategy';

/**
 * Safe normalized motion configuration used internally by the engine.
 *
 * A normalized config has all defaults resolved and is safer to use than raw
 * {@link MotionConfig}. It is produced by the configured motion normalizer.
 */
export type NormalizedMotionConfig = {
  /**
   * Stable motion config identifier.
   */
  readonly id: string;

  /**
   * Registered motion type to play.
   */
  readonly type: string;

  /**
   * Resolved trigger.
   */
  readonly trigger: MotionTriggerType;

  /**
   * Resolved enabled flag.
   */
  readonly enabled: boolean;

  /**
   * Resolved duration in milliseconds.
   */
  readonly duration: number;

  /**
   * Resolved delay in milliseconds.
   */
  readonly delay: number;

  /**
   * Resolved easing.
   */
  readonly easing: MotionEasing;

  /**
   * Resolved raw options record.
   */
  readonly options: Record<string, unknown>;

  /**
   * Resolved reduced-motion preference flag.
   */
  readonly respectReducedMotion: boolean;

  /**
   * Resolved reduced-motion strategy.
   */
  readonly reducedMotionStrategy: ReducedMotionStrategy;

  /**
   * Resolved conflict strategy.
   */
  readonly conflictStrategy: MotionConflictStrategy;

  /**
   * Resolved priority.
   */
  readonly priority: number;

  /**
   * Resolved metadata record.
   */
  readonly metadata: Record<string, unknown>;
};
