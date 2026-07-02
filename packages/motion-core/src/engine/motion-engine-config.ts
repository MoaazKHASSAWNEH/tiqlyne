import type { MotionConfigNormalizer } from '../contracts/motion-config-normalizer';
import type { MotionDriver } from '../contracts/motion-driver';
import type { MotionRegistry } from '../contracts/motion-registry';
import type { MotionEngineEvents } from '../models/motion-engine-events';
import type { MotionTimelineDefaults } from '../models/motion-timeline';
import type { MotionValidationOptions } from '../models/motion-validation-options';

/**
 * Configuration used to create a motion engine instance.
 *
 * The driver is required because the core delegates runtime execution to it.
 * The registry and normalizer are optional so applications can use the default
 * implementations when creating an engine through helper factories.
 *
 * @typeParam TTarget - Runtime target type accepted by the configured driver.
 */
export type MotionEngineConfig<TTarget = unknown> = {
  /**
   * Driver responsible for executing prepared timelines.
   */
  readonly driver: MotionDriver<TTarget>;

  /**
   * Optional registry containing available motion definitions.
   */
  readonly registry?: MotionRegistry;

  /**
   * Optional config normalizer.
   */
  readonly normalizer?: MotionConfigNormalizer;

  /**
   * Global timeline defaults applied by the engine when a timeline does not
   * provide its own defaults.
   *
   * Priority:
   * step > track defaults > timeline defaults > engine defaults > core defaults
   */
  readonly defaults?: MotionTimelineDefaults;

  /**
   * Global validation options used by the engine.
   *
   * They can still be overridden per direct timeline playback call.
   */
  readonly validation?: MotionValidationOptions;

  /**
   * Global engine event listeners.
   *
   * Events are observational: they must not change the planning or playback result.
   */
  readonly events?: MotionEngineEvents<TTarget>;
};
