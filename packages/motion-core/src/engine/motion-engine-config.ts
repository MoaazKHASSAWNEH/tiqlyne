import type { MotionConfigNormalizer } from '../contracts/motion-config-normalizer';
import type { MotionDriver } from '../contracts/motion-driver';
import type { MotionRegistry } from '../contracts/motion-registry';
import type { MotionTimelineDefaults } from '../models/motion-timeline';
import type { MotionValidationOptions } from '../models/motion-validation-options';
import type { MotionEngineEvents } from '../models/motion-engine-events';

export type MotionEngineConfig<TTarget = unknown> = {
  readonly driver: MotionDriver<TTarget>;
  readonly registry?: MotionRegistry;
  readonly normalizer?: MotionConfigNormalizer;

  /**
   * Global timeline defaults applied by the engine when a timeline
   * does not provide its own defaults.
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
