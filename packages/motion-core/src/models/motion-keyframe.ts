import type { MotionFilterValue } from './motion-filter';
import type { MotionTransformValue } from './motion-transform';

/**
 * Framework-agnostic keyframe used by motion timelines.
 *
 * The official motion pack should prefer performant properties such as
 * `opacity` and `transform`. Other properties are available for controlled
 * visual feedback, but should be used carefully in interactive interfaces.
 */
export type MotionKeyframe = {
  /**
   * Opacity value between `0` and `1`.
   */
  readonly opacity?: number;

  /**
   * Transform value represented as a string or structured transform object.
   */
  readonly transform?: string | MotionTransformValue;

  /**
   * Filter value for visual effects.
   */
  readonly filter?: MotionFilterValue;

  /**
   * Background color value.
   */
  readonly backgroundColor?: string;

  /**
   * Text color value.
   */
  readonly color?: string;

  /**
   * Border color value.
   */
  readonly borderColor?: string;

  /**
   * Box shadow value.
   */
  readonly boxShadow?: string;

  /**
   * Outline color value, useful for accessible focus or validation feedback.
   */
  readonly outlineColor?: string;

  /**
   * Keyframe offset between `0` and `1`.
   */
  readonly offset?: number;

  /**
   * Custom driver-specific properties.
   *
   * Custom values are intentionally limited to strings and numbers so they stay
   * relatively safe for serialization and tooling.
   */
  readonly custom?: Record<string, string | number>;
};
