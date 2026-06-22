import {
  validateMotionTimeline,
  type MotionDriver,
  type MotionPlayOptions,
  type MotionPlaybackResult,
  type MotionPlaybackController,
  type MotionTimelineDefinition,
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
import {
  createFailedWebPlayback,
  createFinishedWebPlayback,
  createSkippedWebPlayback
} from '../utils/create-web-playback-result';
import {
  resolveWebActiveExecutionPlan,
  resolveWebPlayableTimeline,
  resolveWebReducedMotionDiagnostics,
  resolveWebScheduledTimeline
} from '../utils/resolve-web-reduced-motion';

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
      return createSkippedWebPlayback('reduced-motion');
    }

    const diagnostics = resolveWebReducedMotionDiagnostics(
      options,
      shouldApplyReducedMotion,
      this.name
    );
    const playableTimeline = resolveWebPlayableTimeline(
      timeline,
      options,
      shouldApplyReducedMotion
    );
    const activeExecutionPlan = resolveWebActiveExecutionPlan(options, shouldApplyReducedMotion);

    const scheduledTimeline = resolveWebScheduledTimeline(
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
        return createFailedWebPlayback('invalid-timeline', [], {
          diagnostics: validation.diagnostics
        });
      }
    }

    const trackTargets = resolveWebTrackTargets(target, playableTimeline);

    if (!trackTargets) {
      return createFailedWebPlayback('target-not-found');
    }

    const conflictStrategy = this.getEffectiveConflictStrategy(options);

    if (conflictStrategy === 'ignore' && this.hasActiveAnimations(trackTargets)) {
      return createSkippedWebPlayback('motion-conflict-ignored');
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
          return createFailedWebPlayback('target-not-found', animations);
        }

        animations.push(...taskAnimations);
      }
    } else {
      for (const track of playableTimeline.tracks) {
        const trackTargets = resolveWebTargets(target, track.target);

        if (trackTargets.length === 0) {
          return createFailedWebPlayback('target-not-found', animations);
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

    return createFinishedWebPlayback(animations, diagnostics);
  }

  private createPlaybackId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `web_playback_${Date.now()}`;
  }
}
