import { DefaultMotionConfigNormalizer } from '../normalizer/default-motion-config-normalizer';
import { DefaultMotionRegistry } from '../registry/default-motion-registry';
import { DefaultMotionEngine } from './default-motion-engine';
import type { MotionEngine } from '../contracts/motion-engine';
import type { MotionEngineConfig } from './motion-engine-config';

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
