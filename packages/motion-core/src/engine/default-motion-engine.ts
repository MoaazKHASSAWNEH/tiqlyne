import type { MotionConfigNormalizer } from '../contracts/motion-config-normalizer';
import type { MotionDriver } from '../contracts/motion-driver';
import type { MotionEngine } from '../contracts/motion-engine';
import type { MotionRegistry } from '../contracts/motion-registry';
import type { MotionConfig } from '../models/motion-config';
import type { MotionPlaybackResult } from '../models/motion-playback-result';
import type { MotionDefinition } from '../contracts/motion-definition';
import { PromiseMotionPlaybackController } from '../controllers/promise-motion-playback-controller';
import type { MotionPlaybackController } from '../models/motion-playback-controller';
import { validateMotionTimeline } from '../validators/validate-motion-timeline';
import { prepareMotionTimeline } from '../compiler/prepare-motion-timeline';

export type DefaultMotionEngineDependencies<TTarget = unknown> = {
  readonly registry: MotionRegistry;
  readonly driver: MotionDriver<TTarget>;
  readonly normalizer: MotionConfigNormalizer;
};

export class DefaultMotionEngine<TTarget = unknown> implements MotionEngine<TTarget> {
  constructor(private readonly dependencies: DefaultMotionEngineDependencies<TTarget>) {}

  async play(target: TTarget, config: MotionConfig): Promise<MotionPlaybackResult> {
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

      const buildContext = {
        options,
        duration: normalizedConfig.duration,
        delay: normalizedConfig.delay,
        easing: normalizedConfig.easing,
        trigger: normalizedConfig.trigger
      };

      const timeline = definition.buildTimeline(buildContext);

      const timelineValidationResult = this.validateTimeline(timeline);

      if (timelineValidationResult) {
        return timelineValidationResult;
      }

      const preparedTimeline = prepareMotionTimeline(timeline);

      void preparedTimeline;

      const reducedMotionTimeline =
        normalizedConfig.reducedMotionStrategy === 'simplify'
          ? definition.buildReducedMotionTimeline?.(buildContext)
          : undefined;

      if (reducedMotionTimeline !== undefined) {
        const reducedTimelineValidationResult = this.validateTimeline(reducedMotionTimeline);

        if (reducedTimelineValidationResult) {
          return {
            ...reducedTimelineValidationResult,
            reason: 'invalid-reduced-motion-timeline'
          };
        }
      }

      const preparedReducedMotionTimeline =
        reducedMotionTimeline !== undefined
          ? prepareMotionTimeline(reducedMotionTimeline)
          : undefined;

      void preparedReducedMotionTimeline;

      return await this.dependencies.driver.play(target, timeline, {
        trigger: normalizedConfig.trigger,
        respectReducedMotion: normalizedConfig.respectReducedMotion,
        reducedMotionStrategy: normalizedConfig.reducedMotionStrategy,
        conflictStrategy: normalizedConfig.conflictStrategy,
        timelineValidated: true,
        ...(reducedMotionTimeline !== undefined
          ? {
              reducedMotionTimeline,
              reducedMotionTimelineValidated: true
            }
          : {})
      });
    } catch (error: unknown) {
      return {
        status: 'failed',
        reason: 'motion-engine-error',
        error
      };
    }
  }

  async cancel(target: TTarget): Promise<MotionPlaybackResult> {
    if (!this.dependencies.driver.cancel) {
      return {
        status: 'skipped',
        reason: 'driver-cancel-not-supported'
      };
    }

    return await this.dependencies.driver.cancel(target);
  }

  async finish(target: TTarget): Promise<MotionPlaybackResult> {
    if (!this.dependencies.driver.finish) {
      return {
        status: 'skipped',
        reason: 'driver-finish-not-supported'
      };
    }

    return await this.dependencies.driver.finish(target);
  }

  async reset(target: TTarget): Promise<MotionPlaybackResult> {
    if (!this.dependencies.driver.reset) {
      return {
        status: 'skipped',
        reason: 'driver-reset-not-supported'
      };
    }

    return await this.dependencies.driver.reset(target);
  }

  createPlayback(target: TTarget, config: MotionConfig): MotionPlaybackController {
    const normalizedConfig = this.dependencies.normalizer.normalize(config);
    const playbackId = normalizedConfig.id;

    const fallback = (): MotionPlaybackController => {
      const finished = this.play(target, config);

      return new PromiseMotionPlaybackController(
        playbackId,
        finished,
        () => this.cancel(target),
        () => this.finish(target)
      );
    };

    if (!normalizedConfig.enabled) {
      return fallback();
    }

    const definition = this.dependencies.registry.get(normalizedConfig.type);

    if (!definition) {
      return fallback();
    }

    try {
      const options = definition.normalizeOptions(normalizedConfig.options);
      const validationErrors = definition.validateOptions?.(options) ?? [];

      if (validationErrors.length > 0) {
        return fallback();
      }

      const buildContext = {
        options,
        duration: normalizedConfig.duration,
        delay: normalizedConfig.delay,
        easing: normalizedConfig.easing,
        trigger: normalizedConfig.trigger
      };

      const timeline = definition.buildTimeline(buildContext);

      const timelineValidationResult = this.validateTimeline(timeline);

      if (timelineValidationResult) {
        return fallback();
      }

      const preparedTimeline = prepareMotionTimeline(timeline);

      void preparedTimeline;

      const reducedMotionTimeline =
        normalizedConfig.reducedMotionStrategy === 'simplify'
          ? definition.buildReducedMotionTimeline?.(buildContext)
          : undefined;

      if (reducedMotionTimeline !== undefined) {
        const reducedTimelineValidationResult = this.validateTimeline(reducedMotionTimeline);

        if (reducedTimelineValidationResult) {
          return fallback();
        }
      }

      const preparedReducedMotionTimeline =
        reducedMotionTimeline !== undefined
          ? prepareMotionTimeline(reducedMotionTimeline)
          : undefined;

      void preparedReducedMotionTimeline;

      if (!this.dependencies.driver.createPlayback) {
        return fallback();
      }

      return this.dependencies.driver.createPlayback(target, timeline, {
        trigger: normalizedConfig.trigger,
        respectReducedMotion: normalizedConfig.respectReducedMotion,
        reducedMotionStrategy: normalizedConfig.reducedMotionStrategy,
        conflictStrategy: normalizedConfig.conflictStrategy,
        timelineValidated: true,
        ...(reducedMotionTimeline !== undefined
          ? {
              reducedMotionTimeline,
              reducedMotionTimelineValidated: true
            }
          : {})
      });
    } catch {
      return fallback();
    }
  }

  private validateTimeline(
    timeline: ReturnType<MotionDefinition['buildTimeline']>
  ): MotionPlaybackResult | null {
    const validation = validateMotionTimeline(timeline);

    if (validation.valid) {
      return null;
    }

    return {
      status: 'failed',
      reason: 'invalid-timeline',
      diagnostics: validation.diagnostics
    };
  }
}
