import {
  validateMotionTimeline,
  type MotionExecutionPlan,
  type MotionDiagnostic,
  type MotionDriver,
  type MotionPlayOptions,
  type MotionPlaybackResult,
  type MotionPlaybackController,
  type MotionTimelineDefinition,
  type MotionKeyframe,
  type MotionConflictStrategy,
  type ScheduledMotionTask,
  type ScheduledMotionTimeline
} from '@structifyx/motion-core';
import { WebMotionPlaybackController } from '../controllers/web-motion-playback-controller';
import { resolveStaggerOffset } from '../utils/resolve-stagger-offset';
import { resolveWebTargets, resolveWebTrackTargets } from '../utils/resolve-web-targets';
import {
  createWebAnimationFromStep,
  createWebAnimationsFromScheduledTask
} from '../utils/create-web-animation';
import type { WebPlaybackCreationResult } from '../models/web-playback-creation-result';

export type WebMotionDriverOptions = {
  readonly reducedMotion?: boolean;
  readonly cancelPreviousAnimations?: boolean;
};

export class WebMotionDriver implements MotionDriver<Element> {
  readonly name = 'web';

  constructor(private readonly options: WebMotionDriverOptions = {}) {}

  async play(
    target: Element,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult> {
    return await this.createWebPlayback(target, timeline, options).finished;
  }

  createPlayback(
    target: Element,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): MotionPlaybackController {
    const playback = this.createWebPlayback(target, timeline, options);

    return new WebMotionPlaybackController(
      this.createPlaybackId(),
      playback.animations,
      playback.finished
    );
  }

  async cancel(target: Element): Promise<MotionPlaybackResult> {
    target.getAnimations({ subtree: true }).forEach((animation) => {
      animation.cancel();
    });

    return {
      status: 'cancelled',
      reason: 'web-driver-cancel'
    };
  }

  async finish(target: Element): Promise<MotionPlaybackResult> {
    target.getAnimations({ subtree: true }).forEach((animation) => {
      animation.finish();
    });

    return {
      status: 'finished',
      reason: 'web-driver-finish'
    };
  }

  async reset(target: Element): Promise<MotionPlaybackResult> {
    target.getAnimations({ subtree: true }).forEach((animation) => {
      animation.cancel();
    });

    target.removeAttribute('style');

    return {
      status: 'finished',
      reason: 'web-driver-reset'
    };
  }

  private createGenericReducedMotionFallbackDiagnostic(): MotionDiagnostic {
    return {
      level: 'warning',
      code: 'reduced-motion-fallback-used',
      message:
        'Generic reduced motion fallback was used because no motion-specific reduced timeline was provided.',
      source: this.name,
      metadata: {
        strategy: 'simplify'
      }
    };
  }

  private simplifyTimeline(timeline: MotionTimelineDefinition): MotionTimelineDefinition {
    return {
      tracks: timeline.tracks.map((track) => ({
        target: track.target,
        steps: track.steps.map((step) => ({
          keyframes: step.keyframes.map((keyframe) => this.simplifyKeyframe(keyframe)),
          duration: Math.min(step.duration, 150),
          delay: 0,
          easing: 'ease-out',
          fill: step.fill ?? 'both'
        }))
      }))
    };
  }

  private resolvePlayableTimeline(
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions,
    shouldApplyReducedMotion: boolean
  ): MotionTimelineDefinition {
    if (shouldApplyReducedMotion && options.reducedMotionStrategy === 'simplify') {
      return (
        options.executionPlan?.reducedMotionTimeline ??
        options.reducedMotionTimeline ??
        this.simplifyTimeline(timeline)
      );
    }

    return options.executionPlan?.timeline ?? timeline;
  }

  private resolveActiveExecutionPlan(
    options: MotionPlayOptions,
    shouldApplyReducedMotion: boolean
  ): MotionExecutionPlan | undefined {
    if (!options.executionPlan) {
      return undefined;
    }

    if (shouldApplyReducedMotion && options.reducedMotionStrategy === 'simplify') {
      return options.executionPlan.scheduledReducedMotionTimeline !== undefined
        ? options.executionPlan
        : undefined;
    }

    return options.executionPlan;
  }

  private resolveScheduledTimeline(
    executionPlan: MotionExecutionPlan | undefined,
    shouldApplyReducedMotion: boolean,
    options: MotionPlayOptions
  ): ScheduledMotionTimeline | undefined {
    if (!executionPlan) {
      return undefined;
    }

    if (shouldApplyReducedMotion && options.reducedMotionStrategy === 'simplify') {
      return executionPlan.scheduledReducedMotionTimeline;
    }

    return executionPlan.scheduledTimeline;
  }

  private createAnimationsFromScheduledTask(
    root: Element,
    scheduledTimeline: ScheduledMotionTimeline,
    task: ScheduledMotionTask
  ): ReadonlyArray<Animation> | null {
    const track = scheduledTimeline.source.tracks[task.trackIndex];

    if (!track) {
      return null;
    }

    const taskTargets = resolveWebTargets(root, track.target);

    if (taskTargets.length === 0) {
      return null;
    }

    return createWebAnimationsFromScheduledTask(taskTargets, task, track.stagger);
  }

  private simplifyKeyframe(keyframe: MotionKeyframe): MotionKeyframe {
    return {
      ...(keyframe.opacity !== undefined
        ? {
            opacity: keyframe.opacity
          }
        : {}),
      ...(keyframe.offset !== undefined
        ? {
            offset: keyframe.offset
          }
        : {})
    };
  }

  private cancelAnimations(targets: ReadonlyArray<Element>): void {
    for (const target of targets) {
      target.getAnimations({ subtree: true }).forEach((animation) => {
        animation.cancel();
      });
    }
  }

  private getEffectiveConflictStrategy(options: MotionPlayOptions): MotionConflictStrategy {
    if (this.options.cancelPreviousAnimations === false && options.conflictStrategy === 'replace') {
      return 'parallel';
    }

    return options.conflictStrategy;
  }

  private hasActiveAnimations(targets: ReadonlyArray<Element>): boolean {
    return targets.some((target) =>
      target
        .getAnimations({
          subtree: true
        })
        .some((animation) => this.isActiveAnimation(animation))
    );
  }

  private isActiveAnimation(animation: Animation): boolean {
    return (
      animation.playState === 'running' || animation.playState === 'paused' || animation.pending
    );
  }

  private createWebPlayback(
    target: Element,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): WebPlaybackCreationResult {
    const shouldApplyReducedMotion =
      options.respectReducedMotion && this.options.reducedMotion === true;

    if (shouldApplyReducedMotion && options.reducedMotionStrategy === 'skip') {
      return {
        animations: [],
        finished: Promise.resolve({
          status: 'skipped',
          reason: 'reduced-motion'
        })
      };
    }

    const hasProvidedReducedMotionTimeline =
      options.executionPlan?.reducedMotionTimeline !== undefined ||
      options.reducedMotionTimeline !== undefined;

    const shouldUseGenericReducedMotionFallback =
      shouldApplyReducedMotion &&
      options.reducedMotionStrategy === 'simplify' &&
      !hasProvidedReducedMotionTimeline;

    const diagnostics = shouldUseGenericReducedMotionFallback
      ? [this.createGenericReducedMotionFallbackDiagnostic()]
      : [];

    const playableTimeline = this.resolvePlayableTimeline(
      timeline,
      options,
      shouldApplyReducedMotion
    );

    const activeExecutionPlan = this.resolveActiveExecutionPlan(options, shouldApplyReducedMotion);

    const scheduledTimeline = this.resolveScheduledTimeline(
      activeExecutionPlan,
      shouldApplyReducedMotion,
      options
    );

    const shouldValidateTimeline =
      shouldApplyReducedMotion && options.reducedMotionStrategy === 'simplify'
        ? options.reducedMotionTimelineValidated !== true
        : options.timelineValidated !== true;

    if (shouldValidateTimeline) {
      const validation = validateMotionTimeline(playableTimeline);

      if (!validation.valid) {
        return {
          animations: [],
          finished: Promise.resolve({
            status: 'failed',
            reason: 'invalid-timeline',
            diagnostics: validation.diagnostics
          })
        };
      }
    }

    const trackTargets = resolveWebTrackTargets(target, playableTimeline);

    if (!trackTargets) {
      return {
        animations: [],
        finished: Promise.resolve({
          status: 'failed',
          reason: 'target-not-found'
        })
      };
    }

    const conflictStrategy = this.getEffectiveConflictStrategy(options);

    if (conflictStrategy === 'ignore' && this.hasActiveAnimations(trackTargets)) {
      return {
        animations: [],
        finished: Promise.resolve({
          status: 'skipped',
          reason: 'motion-conflict-ignored'
        })
      };
    }

    if (conflictStrategy === 'replace') {
      this.cancelAnimations(trackTargets);
    }

    const animations: Animation[] = [];

    if (scheduledTimeline !== undefined) {
      for (const task of scheduledTimeline.tasks) {
        const taskAnimations = this.createAnimationsFromScheduledTask(
          target,
          scheduledTimeline,
          task
        );

        if (!taskAnimations) {
          return {
            animations,
            finished: Promise.resolve({
              status: 'failed',
              reason: 'target-not-found'
            })
          };
        }

        animations.push(...taskAnimations);
      }
    } else {
      for (const track of playableTimeline.tracks) {
        const trackTargets = resolveWebTargets(target, track.target);

        if (trackTargets.length === 0) {
          return {
            animations,
            finished: Promise.resolve({
              status: 'failed',
              reason: 'target-not-found'
            })
          };
        }

        for (const step of track.steps) {
          for (const [targetIndex, trackTarget] of trackTargets.entries()) {
            const staggerOffset = resolveStaggerOffset(
              track.stagger,
              targetIndex,
              trackTargets.length
            );
            const animation = createWebAnimationFromStep(trackTarget, step, staggerOffset);

            animations.push(animation);
          }
        }
      }
    }

    return {
      animations,
      finished: Promise.all(animations.map((animation) => animation.finished))
        .then(
          (): MotionPlaybackResult => ({
            status: 'finished',
            ...(diagnostics.length > 0
              ? {
                  diagnostics
                }
              : {})
          })
        )
        .catch(
          (error: unknown): MotionPlaybackResult => ({
            status: 'failed',
            reason: 'web-animation-error',
            error
          })
        )
    };
  }

  private createPlaybackId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `web_playback_${Date.now()}`;
  }
}
