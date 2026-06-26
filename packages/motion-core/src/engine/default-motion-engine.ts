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
import { createMotionExecutionPlan } from '../planner/create-motion-execution-plan';
import type { MotionExecutionPlan } from '../models/motion-execution-plan';
import { MotionPlanningError } from './motion-planning-error';
import { normalizeMotionTimelinePlayOptions } from './normalize-motion-timeline-play-options';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import type { MotionTimelinePlayOptions } from '../models/motion-timeline-play-options';

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
      const executionPlan = this.plan(config);

      return await this.dependencies.driver.play(target, executionPlan.timeline, {
        trigger: normalizedConfig.trigger,
        respectReducedMotion: normalizedConfig.respectReducedMotion,
        reducedMotionStrategy: normalizedConfig.reducedMotionStrategy,
        conflictStrategy: normalizedConfig.conflictStrategy,
        executionPlan,
        timelineValidated: true,
        ...(executionPlan.reducedMotionTimeline !== undefined
          ? {
              reducedMotionTimeline: executionPlan.reducedMotionTimeline,
              reducedMotionTimelineValidated: true
            }
          : {})
      });
    } catch (error: unknown) {
      if (error instanceof MotionPlanningError) {
        return {
          status: 'failed',
          reason: error.code,
          ...(error.diagnostics.length > 0
            ? {
                diagnostics: error.diagnostics
              }
            : {}),
          ...(error.validationErrors.length > 0
            ? {
                error: error.validationErrors
              }
            : {})
        };
      }

      return {
        status: 'failed',
        reason: 'motion-engine-error',
        error
      };
    }
  }

  async playTimeline(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): Promise<MotionPlaybackResult> {
    const normalizedOptions = normalizeMotionTimelinePlayOptions(options);

    try {
      const executionPlan = this.planTimeline(timeline, options);

      return await this.dependencies.driver.play(target, executionPlan.timeline, {
        trigger: normalizedOptions.trigger,
        respectReducedMotion: normalizedOptions.respectReducedMotion,
        reducedMotionStrategy: normalizedOptions.reducedMotionStrategy,
        conflictStrategy: normalizedOptions.conflictStrategy,
        executionPlan,
        timelineValidated: true,
        ...(options?.reducedMotionTimeline !== undefined
          ? {
              reducedMotionTimeline: options.reducedMotionTimeline,
              reducedMotionTimelineValidated: true
            }
          : {})
      });
    } catch (error: unknown) {
      if (error instanceof MotionPlanningError) {
        return {
          status: 'failed',
          reason: error.code,
          ...(error.diagnostics.length > 0
            ? {
                diagnostics: error.diagnostics
              }
            : {}),
          ...(error.validationErrors.length > 0
            ? {
                error: error.validationErrors
              }
            : {})
        };
      }

      return {
        status: 'failed',
        reason: 'motion-engine-error',
        error
      };
    }
  }

  plan(config: MotionConfig): MotionExecutionPlan {
    const normalizedConfig = this.dependencies.normalizer.normalize(config);

    if (!normalizedConfig.enabled) {
      throw new MotionPlanningError('Motion is disabled.', 'motion-disabled');
    }

    const definition = this.dependencies.registry.get(normalizedConfig.type);

    if (!definition) {
      throw new MotionPlanningError('Unknown motion type.', 'unknown-motion-type');
    }

    const options = definition.normalizeOptions(normalizedConfig.options);
    const validationErrors = definition.validateOptions?.(options) ?? [];

    if (validationErrors.length > 0) {
      throw new MotionPlanningError(
        'Motion options are invalid.',
        'invalid-motion-options',
        [],
        validationErrors
      );
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
      throw new MotionPlanningError(
        'Motion timeline is invalid.',
        'invalid-timeline',
        timelineValidationResult.diagnostics ?? []
      );
    }

    const reducedMotionTimeline =
      normalizedConfig.reducedMotionStrategy === 'simplify'
        ? definition.buildReducedMotionTimeline?.(buildContext)
        : undefined;

    if (reducedMotionTimeline !== undefined) {
      const reducedTimelineValidationResult = this.validateTimeline(reducedMotionTimeline);

      if (reducedTimelineValidationResult) {
        throw new MotionPlanningError(
          'Reduced motion timeline is invalid.',
          'invalid-reduced-motion-timeline',
          reducedTimelineValidationResult.diagnostics ?? []
        );
      }
    }

    return createMotionExecutionPlan({
      timeline,
      ...(reducedMotionTimeline !== undefined
        ? {
            reducedMotionTimeline
          }
        : {})
    });
  }

  planTimeline(
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionExecutionPlan {
    const normalizedOptions = normalizeMotionTimelinePlayOptions(options);

    const timelineValidationResult = this.validateTimeline(timeline, normalizedOptions.validation);

    if (timelineValidationResult) {
      throw new MotionPlanningError(
        'Motion timeline is invalid.',
        'invalid-timeline',
        timelineValidationResult.diagnostics ?? []
      );
    }

    const reducedMotionTimeline = options?.reducedMotionTimeline;

    if (reducedMotionTimeline !== undefined) {
      const reducedTimelineValidationResult = this.validateTimeline(
        reducedMotionTimeline,
        normalizedOptions.validation
      );

      if (reducedTimelineValidationResult) {
        throw new MotionPlanningError(
          'Reduced motion timeline is invalid.',
          'invalid-reduced-motion-timeline',
          reducedTimelineValidationResult.diagnostics ?? []
        );
      }
    }

    return createMotionExecutionPlan({
      timeline,
      ...(reducedMotionTimeline !== undefined
        ? {
            reducedMotionTimeline
          }
        : {})
    });
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
      const executionPlan = this.plan(config);

      if (!this.dependencies.driver.createPlayback) {
        return fallback();
      }

      return this.dependencies.driver.createPlayback(target, executionPlan.timeline, {
        trigger: normalizedConfig.trigger,
        respectReducedMotion: normalizedConfig.respectReducedMotion,
        reducedMotionStrategy: normalizedConfig.reducedMotionStrategy,
        conflictStrategy: normalizedConfig.conflictStrategy,
        executionPlan,
        timelineValidated: true,
        ...(executionPlan.reducedMotionTimeline !== undefined
          ? {
              reducedMotionTimeline: executionPlan.reducedMotionTimeline,
              reducedMotionTimelineValidated: true
            }
          : {})
      });
    } catch {
      return fallback();
    }
  }

  createTimelinePlayback(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionPlaybackController {
    const fallback = (): MotionPlaybackController => {
      const finished = this.playTimeline(target, timeline, options);

      return new PromiseMotionPlaybackController(
        'direct_timeline',
        finished,
        () => this.cancel(target),
        () => this.finish(target)
      );
    };

    try {
      const executionPlan = this.planTimeline(timeline, options);

      if (!this.dependencies.driver.createPlayback) {
        return fallback();
      }

      const normalizedOptions = normalizeMotionTimelinePlayOptions(options);

      return this.dependencies.driver.createPlayback(target, executionPlan.timeline, {
        trigger: normalizedOptions.trigger,
        respectReducedMotion: normalizedOptions.respectReducedMotion,
        reducedMotionStrategy: normalizedOptions.reducedMotionStrategy,
        conflictStrategy: normalizedOptions.conflictStrategy,
        executionPlan,
        timelineValidated: true,
        ...(executionPlan.reducedMotionTimeline !== undefined
          ? {
              reducedMotionTimeline: executionPlan.reducedMotionTimeline,
              reducedMotionTimelineValidated: true
            }
          : {})
      });
    } catch {
      return fallback();
    }
  }

  private validateTimeline(
    timeline: MotionTimelineDefinition,
    validationOptions?: MotionTimelinePlayOptions['validation']
  ): MotionPlaybackResult | null {
    const validation = validateMotionTimeline(timeline, validationOptions);

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
