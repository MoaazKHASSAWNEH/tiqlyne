import type { MotionBuildContext, MotionDefinition } from '../contracts/motion-definition';
import type { MotionCategory } from '../models/motion-category';
import type { MotionOptionDefinition } from '../models/motion-option-definition';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

/**
 * Convenience abstract base class for creating motion definitions manually.
 *
 * This class implements the optional `validateOptions` hook with a permissive
 * default that returns no validation errors. Custom motions can extend this
 * class when they want full control over option normalization and timeline
 * creation without using the schema-based options API.
 *
 * @typeParam TOptions - Strongly typed options accepted by the motion.
 */
export abstract class BaseMotionDefinition<
  TOptions extends object
> implements MotionDefinition<TOptions> {
  /**
   * Unique motion type used by configs and registries.
   */
  abstract readonly type: string;

  /**
   * Human-readable motion label.
   */
  abstract readonly label: string;

  /**
   * Short human-readable description.
   */
  abstract readonly description: string;

  /**
   * Motion category used by registries and builders.
   */
  abstract readonly category: MotionCategory;

  /**
   * Builder-friendly option definitions exposed by this motion.
   */
  abstract readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition>;

  /**
   * Returns the default strongly typed options for this motion.
   */
  abstract getDefaultOptions(): TOptions;

  /**
   * Normalizes raw user options into strongly typed options.
   */
  abstract normalizeOptions(options: Record<string, unknown> | undefined): TOptions;

  /**
   * Validates normalized options.
   *
   * Subclasses can override this method to return validation error messages.
   */
  validateOptions(_options: TOptions): ReadonlyArray<string> {
    return [];
  }

  /**
   * Builds the timeline for this motion.
   */
  abstract buildTimeline(context: MotionBuildContext<TOptions>): MotionTimelineDefinition;
}
