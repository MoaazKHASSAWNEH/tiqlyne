import type { MotionConfigNormalizer } from '../contracts/motion-config-normalizer';
import type { MotionDriver } from '../contracts/motion-driver';
import type { MotionEngine } from '../contracts/motion-engine';
import type { MotionRegistry } from '../contracts/motion-registry';
import type { MotionConfig } from '../models/motion-config';
import type { MotionPlaybackResult } from '../models/motion-playback-result';

export type DefaultMotionEngineDependencies<TTarget = unknown> = {
  readonly registry: MotionRegistry;
  readonly driver: MotionDriver<TTarget>;
  readonly normalizer: MotionConfigNormalizer;
};

export class DefaultMotionEngine<TTarget = unknown>
  implements MotionEngine<TTarget>
{
  constructor(
    private readonly dependencies: DefaultMotionEngineDependencies<TTarget>
  ) {}

  async play(
    target: TTarget,
    config: MotionConfig
  ): Promise<MotionPlaybackResult> {
    const normalizedConfig = this.dependencies.normalizer.normalize(config);

    if (!normalizedConfig.enabled) {
      return {
        status: 'skipped',
        reason: 'motion-disabled'
      };
    }

    const definition = this.dependencies.registry.get(normalizedConfig.type);

    if (!definition) {
      return {
        status: 'skipped',
        reason: 'unknown-motion-type'
      };
    }

    try {
      const options = definition.normalizeOptions(normalizedConfig.options);
      const validationErrors = definition.validateOptions?.(options) ?? [];

      if (validationErrors.length > 0) {
        return {
          status: 'failed',
          reason: 'invalid-motion-options',
          error: validationErrors
        };
      }

      const timeline = definition.buildTimeline({
        options,
        duration: normalizedConfig.duration,
        delay: normalizedConfig.delay,
        easing: normalizedConfig.easing,
        trigger: normalizedConfig.trigger
      });

      return await this.dependencies.driver.play(target, timeline, {
        trigger: normalizedConfig.trigger,
        respectReducedMotion: normalizedConfig.respectReducedMotion
      });
    } catch (error: unknown) {
      return {
        status: 'failed',
        reason: 'motion-engine-error',
        error
      };
    }
  }
}