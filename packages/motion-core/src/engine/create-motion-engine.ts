import type { MotionEngine } from '../contracts/motion-engine';
import { DefaultMotionConfigNormalizer } from '../normalizer/default-motion-config-normalizer';
import { DefaultMotionRegistry } from '../registry/default-motion-registry';
import { DefaultMotionEngine } from './default-motion-engine';
import type { MotionEngineConfig } from './motion-engine-config';

/**
 * Creates a default motion engine instance.
 *
 * This factory wires the default registry and config normalizer when they are
 * not provided explicitly. Applications usually use this helper instead of
 * instantiating {@link DefaultMotionEngine} manually.
 *
 * @typeParam TTarget - Runtime target type accepted by the configured driver.
 * @param config - Engine configuration.
 * @returns Configured motion engine.
 */
export function createMotionEngine<TTarget = unknown>(
  config: MotionEngineConfig<TTarget>
): MotionEngine<TTarget> {
  return new DefaultMotionEngine<TTarget>({
    driver: config.driver,
    registry: config.registry ?? new DefaultMotionRegistry(),
    normalizer: config.normalizer ?? new DefaultMotionConfigNormalizer(),
    ...(config.defaults !== undefined
      ? {
          defaults: config.defaults
        }
      : {}),
    ...(config.validation !== undefined
      ? {
          validation: config.validation
        }
      : {}),
    ...(config.events !== undefined
      ? {
          events: config.events
        }
      : {})
  });
}
