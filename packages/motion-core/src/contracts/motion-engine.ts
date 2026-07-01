import type { MotionCompositionDefinition } from '../composition/motion-composition-definition';
import type { MotionCategory } from '../models/motion-category';
import type { MotionConfig } from '../models/motion-config';
import type { MotionExecutionPlan } from '../models/motion-execution-plan';
import type { MotionPlaybackController } from '../models/motion-playback-controller';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import type { MotionTimelinePlayOptions } from '../models/motion-timeline-play-options';
import type { MotionDefinition } from './motion-definition';

/**
 * Main public API used to register, plan and play motion definitions.
 *
 * A motion engine is intentionally independent from the execution platform.
 * It delegates the real playback work to a {@link MotionDriver}, which allows
 * the same core engine to work with browser animations, tests, no-op drivers,
 * or custom runtimes.
 *
 * @typeParam TTarget - The target type accepted by the underlying driver.
 * For the web driver this is usually an `Element`; for tests or custom
 * runtimes it can be any application-specific target.
 */
export interface MotionEngine<TTarget = unknown> {
  /**
   * Registers a single reusable motion definition.
   *
   * @typeParam TOptions - The strongly typed options accepted by the motion.
   * @param definition - Motion definition to add to the registry.
   * @returns The current engine instance, allowing fluent registration.
   */
  register<TOptions extends object>(definition: MotionDefinition<TOptions>): MotionEngine<TTarget>;

  /**
   * Registers multiple motion definitions at once.
   *
   * @param definitions - Definitions to add to the registry.
   * @returns The current engine instance, allowing fluent registration.
   */
  registerMany(definitions: ReadonlyArray<MotionDefinition<object>>): MotionEngine<TTarget>;

  /**
   * Checks whether a motion type exists in the registry.
   *
   * @param type - Unique motion type identifier.
   * @returns `true` when a matching definition is registered.
   */
  has(type: string): boolean;

  /**
   * Gets a registered motion definition by type.
   *
   * @param type - Unique motion type identifier.
   * @returns The matching definition, or `undefined` when it is not registered.
   */
  get(type: string): MotionDefinition<object> | undefined;

  /**
   * Gets all registered motion definitions.
   *
   * @returns A readonly list of all registered definitions.
   */
  getAll(): ReadonlyArray<MotionDefinition<object>>;

  /**
   * Gets registered motion definitions matching a category.
   *
   * @param category - Category used to filter definitions.
   * @returns A readonly list of matching definitions.
   */
  getByCategory(category: MotionCategory): ReadonlyArray<MotionDefinition<object>>;

  /**
   * Plans and plays a registered motion.
   *
   * The engine normalizes the config, resolves the motion definition,
   * validates the generated timeline, and then delegates playback to the driver.
   *
   * @param target - Target passed to the driver.
   * @param config - Motion config referencing a registered motion type.
   * @returns Playback result produced by the driver or by the engine fallback logic.
   */
  play(target: TTarget, config: MotionConfig): Promise<MotionPlaybackResult>;

  /**
   * Plans and plays a timeline directly, without looking up a registered motion.
   *
   * This is useful for advanced callers that already have a timeline definition.
   *
   * @param target - Target passed to the driver.
   * @param timeline - Timeline to validate, prepare and play.
   * @param options - Optional play options for direct timeline playback.
   * @returns Playback result produced by the driver or by the engine fallback logic.
   */
  playTimeline(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): Promise<MotionPlaybackResult>;

  /**
   * Cancels animations for a target when the driver supports cancellation.
   *
   * @param target - Target passed to the driver.
   * @returns Cancellation result, or a skipped result when cancellation is unsupported.
   */
  cancel(target: TTarget): Promise<MotionPlaybackResult>;

  /**
   * Finishes animations for a target when the driver supports finishing.
   *
   * @param target - Target passed to the driver.
   * @returns Finish result, or a skipped result when finishing is unsupported.
   */
  finish(target: TTarget): Promise<MotionPlaybackResult>;

  /**
   * Resets animations for a target when the driver supports reset.
   *
   * @param target - Target passed to the driver.
   * @returns Reset result, or a skipped result when reset is unsupported.
   */
  reset(target: TTarget): Promise<MotionPlaybackResult>;

  /**
   * Creates a controllable playback for a registered motion.
   *
   * When the driver supports native playback controllers, the engine returns
   * that controller. Otherwise it falls back to a promise-based controller.
   *
   * @param target - Target passed to the driver.
   * @param config - Motion config referencing a registered motion type.
   * @returns A playback controller.
   */
  createPlayback(target: TTarget, config: MotionConfig): MotionPlaybackController;

  /**
   * Creates a controllable playback for a direct timeline.
   *
   * @param target - Target passed to the driver.
   * @param timeline - Timeline to validate, prepare and play.
   * @param options - Optional play options for direct timeline playback.
   * @returns A playback controller.
   */
  createTimelinePlayback(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionPlaybackController;

  /**
   * Creates an execution plan for a registered motion without playing it.
   *
   * Planning normalizes options, builds the timeline, applies defaults,
   * validates timelines and prepares execution metadata.
   *
   * @param config - Motion config referencing a registered motion type.
   * @returns Execution plan that can be inspected or passed to a driver.
   * @throws MotionPlanningError when the motion cannot be planned.
   */
  plan(config: MotionConfig): MotionExecutionPlan;

  /**
   * Creates an execution plan for a direct timeline without playing it.
   *
   * @param timeline - Timeline to validate and prepare.
   * @param options - Optional direct timeline planning options.
   * @returns Execution plan that can be inspected or passed to a driver.
   * @throws MotionPlanningError when the timeline cannot be planned.
   */
  planTimeline(
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionExecutionPlan;

  /**
   * Compiles, plans and plays a motion composition.
   *
   * @param target - Target passed to the driver.
   * @param composition - Composition to compile into a timeline.
   * @param options - Optional play options.
   * @returns Playback result produced by the driver or by the engine fallback logic.
   */
  playComposition(
    target: TTarget,
    composition: MotionCompositionDefinition,
    options?: MotionTimelinePlayOptions
  ): Promise<MotionPlaybackResult>;

  /**
   * Creates a controllable playback for a motion composition.
   *
   * @param target - Target passed to the driver.
   * @param composition - Composition to compile into a timeline.
   * @param options - Optional play options.
   * @returns A playback controller.
   */
  createCompositionPlayback(
    target: TTarget,
    composition: MotionCompositionDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionPlaybackController;

  /**
   * Compiles and plans a motion composition without playing it.
   *
   * @param composition - Composition to compile into a timeline.
   * @param options - Optional planning options.
   * @returns Execution plan created from the compiled composition timeline.
   * @throws MotionPlanningError when the composition cannot be planned.
   */
  planComposition(
    composition: MotionCompositionDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionExecutionPlan;
}
