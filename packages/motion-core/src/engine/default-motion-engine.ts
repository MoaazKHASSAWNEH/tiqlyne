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
import type {
  MotionTimelineDefaults,
  MotionTimelineDefinition,
  MotionTrackDefinition
} from '../models/motion-timeline';
import type { MotionTimelinePlayOptions } from '../models/motion-timeline-play-options';
import { applyMotionTimelineDefaults } from '../compiler/apply-motion-timeline-defaults';
import type { MotionValidationOptions } from '../models/motion-validation-options';
import type { MotionCategory } from '../models/motion-category';
import type {
  MotionBeforePlanEvent,
  MotionCancelEvent,
  MotionEngineEvents,
  MotionErrorEvent,
  MotionFinishEvent,
  MotionPlanEvent,
  MotionPlayEvent
} from '../models/motion-engine-events';

export type DefaultMotionEngineDependencies<TTarget = unknown> = {
  readonly registry: MotionRegistry;
  readonly driver: MotionDriver<TTarget>;
  readonly normalizer: MotionConfigNormalizer;
  readonly defaults?: MotionTimelineDefaults;
  readonly validation?: MotionValidationOptions;
  readonly events?: MotionEngineEvents<TTarget>;
};

export class DefaultMotionEngine<TTarget = unknown> implements MotionEngine<TTarget> {
  constructor(private readonly dependencies: DefaultMotionEngineDependencies<TTarget>) {}

  register<TOptions extends object>(definition: MotionDefinition<TOptions>): MotionEngine<TTarget> {
    this.dependencies.registry.register(definition);

    return this;
  }

  registerMany(definitions: ReadonlyArray<MotionDefinition<object>>): MotionEngine<TTarget> {
    for (const definition of definitions) {
      this.dependencies.registry.register(definition);
    }

    return this;
  }

  has(type: string): boolean {
    return this.dependencies.registry.has(type);
  }

  get(type: string): MotionDefinition<object> | undefined {
    return this.dependencies.registry.get(type);
  }

  getAll(): ReadonlyArray<MotionDefinition<object>> {
    return this.dependencies.registry.getAll();
  }

  getByCategory(category: MotionCategory): ReadonlyArray<MotionDefinition<object>> {
    return this.dependencies.registry.getByCategory(category);
  }

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

      this.emitPlay({
        type: 'play',
        source: 'registered-motion',
        target,
        motionId: normalizedConfig.id,
        motionType: normalizedConfig.type,
        plan: executionPlan
      });

      const result = await this.dependencies.driver.play(target, executionPlan.timeline, {
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

      this.emitFinish({
        type: 'finish',
        source: 'registered-motion',
        target,
        motionId: normalizedConfig.id,
        motionType: normalizedConfig.type,
        result
      });

      return result;
    } catch (error: unknown) {
      this.emitError({
        type: 'error',
        source: 'registered-motion',
        target,
        motionId: normalizedConfig.id,
        motionType: normalizedConfig.type,
        error
      });

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

      this.emitPlay({
        type: 'play',
        source: 'direct-timeline',
        target,
        plan: executionPlan
      });

      const result = await this.dependencies.driver.play(target, executionPlan.timeline, {
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

      this.emitFinish({
        type: 'finish',
        source: 'direct-timeline',
        target,
        result
      });

      return result;
    } catch (error: unknown) {
      this.emitError({
        type: 'error',
        source: 'direct-timeline',
        target,
        error
      });

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

    this.emitBeforePlan({
      type: 'before-plan',
      source: 'registered-motion',
      motionId: normalizedConfig.id,
      motionType: normalizedConfig.type,
      config
    });

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

    const timeline = this.applyEngineDefaults(definition.buildTimeline(buildContext));

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

    const reducedMotionTimelineWithDefaults =
      reducedMotionTimeline !== undefined
        ? this.applyEngineDefaults(reducedMotionTimeline)
        : undefined;

    if (reducedMotionTimelineWithDefaults !== undefined) {
      const reducedTimelineValidationResult = this.validateTimeline(
        reducedMotionTimelineWithDefaults
      );

      if (reducedTimelineValidationResult) {
        throw new MotionPlanningError(
          'Reduced motion timeline is invalid.',
          'invalid-reduced-motion-timeline',
          reducedTimelineValidationResult.diagnostics ?? []
        );
      }
    }

    const executionPlan = createMotionExecutionPlan({
      timeline,
      ...(reducedMotionTimelineWithDefaults !== undefined
        ? {
            reducedMotionTimeline: reducedMotionTimelineWithDefaults
          }
        : {})
    });

    this.emitPlan({
      type: 'plan',
      source: 'registered-motion',
      motionId: normalizedConfig.id,
      motionType: normalizedConfig.type,
      plan: executionPlan
    });

    return executionPlan;
  }

  planTimeline(
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionExecutionPlan {
    const normalizedOptions = normalizeMotionTimelinePlayOptions(options);

    this.emitBeforePlan({
      type: 'before-plan',
      source: 'direct-timeline',
      timeline
    });

    const timelineWithDefaults = this.applyEngineDefaults(timeline);

    const timelineValidationResult = this.validateTimeline(
      timelineWithDefaults,
      normalizedOptions.validation
    );

    if (timelineValidationResult) {
      throw new MotionPlanningError(
        'Motion timeline is invalid.',
        'invalid-timeline',
        timelineValidationResult.diagnostics ?? []
      );
    }

    const reducedMotionTimeline =
      options?.reducedMotionTimeline !== undefined
        ? this.applyEngineDefaults(options.reducedMotionTimeline)
        : undefined;

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

    const executionPlan = createMotionExecutionPlan({
      timeline: timelineWithDefaults,
      ...(reducedMotionTimeline !== undefined
        ? {
            reducedMotionTimeline
          }
        : {})
    });

    this.emitPlan({
      type: 'plan',
      source: 'direct-timeline',
      plan: executionPlan
    });

    return executionPlan;
  }

  async cancel(target: TTarget): Promise<MotionPlaybackResult> {
    if (!this.dependencies.driver.cancel) {
      const result: MotionPlaybackResult = {
        status: 'skipped',
        reason: 'driver-cancel-not-supported'
      };

      this.emitCancel({
        type: 'cancel',
        target,
        result
      });

      return result;
    }

    const result = await this.dependencies.driver.cancel(target);

    this.emitCancel({
      type: 'cancel',
      target,
      result
    });

    return result;
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

  private emitBeforePlan(event: Omit<MotionBeforePlanEvent<TTarget>, 'timestamp'>): void {
    this.dependencies.events?.onBeforePlan?.({
      type: event.type,
      source: event.source,
      timestamp: Date.now(),
      ...(event.target !== undefined
        ? {
            target: event.target
          }
        : {}),
      ...(event.motionId !== undefined
        ? {
            motionId: event.motionId
          }
        : {}),
      ...(event.motionType !== undefined
        ? {
            motionType: event.motionType
          }
        : {}),
      ...(event.config !== undefined
        ? {
            config: event.config
          }
        : {}),
      ...(event.timeline !== undefined
        ? {
            timeline: event.timeline
          }
        : {})
    });
  }

  private emitPlan(event: Omit<MotionPlanEvent<TTarget>, 'timestamp'>): void {
    this.dependencies.events?.onPlan?.({
      type: event.type,
      source: event.source,
      plan: event.plan,
      timestamp: Date.now(),
      ...(event.target !== undefined
        ? {
            target: event.target
          }
        : {}),
      ...(event.motionId !== undefined
        ? {
            motionId: event.motionId
          }
        : {}),
      ...(event.motionType !== undefined
        ? {
            motionType: event.motionType
          }
        : {})
    });
  }

  private emitPlay(event: Omit<MotionPlayEvent<TTarget>, 'timestamp'>): void {
    this.dependencies.events?.onPlay?.({
      type: event.type,
      source: event.source,
      target: event.target,
      plan: event.plan,
      timestamp: Date.now(),
      ...(event.motionId !== undefined
        ? {
            motionId: event.motionId
          }
        : {}),
      ...(event.motionType !== undefined
        ? {
            motionType: event.motionType
          }
        : {})
    });
  }

  private emitFinish(event: Omit<MotionFinishEvent<TTarget>, 'timestamp'>): void {
    this.dependencies.events?.onFinish?.({
      type: event.type,
      source: event.source,
      target: event.target,
      result: event.result,
      timestamp: Date.now(),
      ...(event.motionId !== undefined
        ? {
            motionId: event.motionId
          }
        : {}),
      ...(event.motionType !== undefined
        ? {
            motionType: event.motionType
          }
        : {})
    });
  }

  private emitCancel(event: Omit<MotionCancelEvent<TTarget>, 'timestamp'>): void {
    this.dependencies.events?.onCancel?.({
      type: event.type,
      target: event.target,
      result: event.result,
      timestamp: Date.now()
    });
  }

  private emitError(event: Omit<MotionErrorEvent<TTarget>, 'timestamp'>): void {
    this.dependencies.events?.onError?.({
      type: event.type,
      source: event.source,
      error: event.error,
      timestamp: Date.now(),
      ...(event.target !== undefined
        ? {
            target: event.target
          }
        : {}),
      ...(event.motionId !== undefined
        ? {
            motionId: event.motionId
          }
        : {}),
      ...(event.motionType !== undefined
        ? {
            motionType: event.motionType
          }
        : {})
    });
  }

  private validateTimeline(
    timeline: MotionTimelineDefinition,
    validationOptions?: MotionValidationOptions
  ): MotionPlaybackResult | null {
    const validation = validateMotionTimeline(
      timeline,
      validationOptions ?? this.dependencies.validation
    );

    if (validation.valid) {
      return null;
    }

    return {
      status: 'failed',
      reason: 'invalid-timeline',
      diagnostics: validation.diagnostics
    };
  }

  private applyEngineDefaults(timeline: MotionTimelineDefinition): MotionTimelineDefinition {
    if (this.dependencies.defaults === undefined) {
      return applyMotionTimelineDefaults(timeline);
    }

    const timelineWithEngineDefaults: MotionTimelineDefinition = {
      ...timeline,
      defaults: {
        ...this.dependencies.defaults,
        ...(timeline.defaults ?? {})
      },
      tracks: timeline.tracks.map((track): MotionTrackDefinition => {
        if (track.defaults === undefined) {
          return track;
        }

        return {
          ...track,
          defaults: {
            ...track.defaults
          }
        };
      })
    };

    return applyMotionTimelineDefaults(timelineWithEngineDefaults);
  }
}
