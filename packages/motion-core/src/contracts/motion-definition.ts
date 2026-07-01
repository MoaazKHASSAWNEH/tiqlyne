import type { MotionCategory } from '../models/motion-category';
import type { MotionEasing } from '../models/motion-easing';
import type { MotionOptionDefinition } from '../models/motion-option-definition';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import type { MotionTriggerType } from '../models/motion-trigger';

/**
 * Context passed to a motion definition when building a timeline.
 *
 * The engine provides normalized options and resolved base timing values so
 * that motion definitions can focus on describing animation steps.
 *
 * @typeParam TOptions - Strongly typed options accepted by the motion definition.
 */
export type MotionBuildContext<TOptions extends object> = {
  /**
   * Normalized motion options.
   */
  readonly options: TOptions;

  /**
   * Resolved duration in milliseconds.
   */
  readonly duration: number;

  /**
   * Resolved delay in milliseconds.
   */
  readonly delay: number;

  /**
   * Resolved easing value.
   */
  readonly easing: MotionEasing;

  /**
   * Trigger that initiated the motion.
   */
  readonly trigger: MotionTriggerType;
};

/**
 * Reusable motion definition registered in a {@link MotionEngine}.
 *
 * A definition describes how to normalize options, validate options and build
 * a timeline. It does not execute animations directly; playback is delegated
 * to the active driver.
 *
 * @typeParam TOptions - Strongly typed options accepted by the motion definition.
 */
export interface MotionDefinition<TOptions extends object = object> {
  /**
   * Unique motion identifier used by configs.
   *
   * Example: `"fade-in"`, `"slide-in"` or `"hero-enter"`.
   */
  readonly type: string;

  /**
   * Human-readable name displayed in tooling or builders.
   */
  readonly label: string;

  /**
   * Short explanation of what the motion does.
   */
  readonly description: string;

  /**
   * Category used to group motions in tooling and registries.
   */
  readonly category: MotionCategory;

  /**
   * Public option schema used by tooling, builders and documentation.
   */
  readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition>;

  /**
   * Returns the default options for this motion.
   *
   * @returns Strongly typed default options.
   */
  getDefaultOptions(): TOptions;

  /**
   * Normalizes unknown user input into strongly typed options.
   *
   * @param options - Raw user options.
   * @returns Normalized options.
   */
  normalizeOptions(options: Record<string, unknown> | undefined): TOptions;

  /**
   * Validates normalized options.
   *
   * @param options - Normalized options.
   * @returns A list of validation error messages. An empty list means valid.
   */
  validateOptions?(options: TOptions): ReadonlyArray<string>;

  /**
   * Builds the main timeline for this motion.
   *
   * @param context - Build context containing normalized options and timing values.
   * @returns Timeline definition ready for engine defaults and validation.
   */
  buildTimeline(context: MotionBuildContext<TOptions>): MotionTimelineDefinition;

  /**
   * Optionally builds a simplified timeline for reduced-motion mode.
   *
   * When omitted, the engine can still apply the configured reduced-motion strategy.
   *
   * @param context - Build context containing normalized options and timing values.
   * @returns Reduced-motion timeline definition.
   */
  buildReducedMotionTimeline?(context: MotionBuildContext<TOptions>): MotionTimelineDefinition;
}
