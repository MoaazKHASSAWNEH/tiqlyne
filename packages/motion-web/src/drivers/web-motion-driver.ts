import {
  applyMotionTimelineDefaults,
  createPlaybackOperationFailedDiagnostic,
  MotionDiagnosticCodes,
  MotionDiagnosticSources,
  MotionPlaybackResultReasons,
  type MotionDriver,
  type MotionPlayOptions,
  type MotionPlaybackController,
  type MotionPlaybackResult,
  type MotionTimelineDefinition
} from '@structifyx/motion-core';
import { WebMotionPlaybackController } from '../controllers/web-motion-playback-controller';
import type { WebPlaybackCreationResult } from '../models/web-playback-creation-result';
import {
  createFailedWebPlayback,
  createFinishedWebPlayback,
  createRunningWebPlayback,
  createSkippedWebPlayback
} from '../utils/create-web-playback-result';
import {
  createWebAnimationsFromScheduledTimeline,
  createWebAnimationsFromTimeline
} from '../utils/create-web-timeline-animations';
import { hasInfiniteWebTimeline } from '../utils/has-infinite-web-timeline';
import {
  cancelWebAnimations,
  getEffectiveWebConflictStrategy,
  hasActiveWebAnimations
} from '../utils/resolve-web-conflict';
import {
  resolveWebActiveExecutionPlan,
  resolveWebPlayableTimeline,
  resolveWebReducedMotionDiagnostics,
  resolveWebScheduledTimeline
} from '../utils/resolve-web-reduced-motion';
import { resolveWebTrackTargets } from '../utils/resolve-web-targets';
import { validateWebPlayableTimeline } from '../utils/validate-web-playable-timeline';

export type WebMotionDriverOptions = {
  readonly reducedMotion?: boolean;
  readonly cancelPreviousAnimations?: boolean;
};

export class WebMotionDriver implements MotionDriver<Element> {
  readonly name = 'web';

  private readonly diagnosticSource = MotionDiagnosticSources.WebMotionDriver;

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
      playback.finished,
      timeline.labels,
      timeline
    );
  }

  async cancel(target: Element): Promise<MotionPlaybackResult> {
    try {
      target.getAnimations({ subtree: true }).forEach((animation) => {
        animation.cancel();
      });

      return {
        status: 'cancelled',
        reason: MotionPlaybackResultReasons.WebDriverCancel
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: MotionPlaybackResultReasons.WebDriverCancelFailed,
        error,
        diagnostics: [
          createPlaybackOperationFailedDiagnostic(
            MotionDiagnosticCodes.WebDriverCancelFailed,
            'Web driver could not cancel animations safely.',
            this.diagnosticSource
          )
        ]
      };
    }
  }

  async finish(target: Element): Promise<MotionPlaybackResult> {
    try {
      target.getAnimations({ subtree: true }).forEach((animation) => {
        animation.finish();
      });

      return {
        status: 'finished',
        reason: MotionPlaybackResultReasons.WebDriverFinish
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: MotionPlaybackResultReasons.WebDriverFinishFailed,
        error,
        diagnostics: [
          createPlaybackOperationFailedDiagnostic(
            MotionDiagnosticCodes.WebDriverFinishFailed,
            'Web driver could not finish animations safely.',
            this.diagnosticSource
          )
        ]
      };
    }
  }

  async reset(target: Element): Promise<MotionPlaybackResult> {
    try {
      target.getAnimations({ subtree: true }).forEach((animation) => {
        animation.cancel();
      });

      target.removeAttribute('style');

      return {
        status: 'finished',
        reason: MotionPlaybackResultReasons.WebDriverReset
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: MotionPlaybackResultReasons.WebDriverResetFailed,
        error,
        diagnostics: [
          createPlaybackOperationFailedDiagnostic(
            MotionDiagnosticCodes.WebDriverResetFailed,
            'Web driver could not reset animations safely.',
            this.diagnosticSource
          )
        ]
      };
    }
  }

  private createWebPlayback(
    target: Element,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): WebPlaybackCreationResult {
    const shouldApplyReducedMotion =
      options.respectReducedMotion && this.options.reducedMotion === true;

    if (shouldApplyReducedMotion && options.reducedMotionStrategy === 'skip') {
      return createSkippedWebPlayback(MotionPlaybackResultReasons.ReducedMotion);
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

    const validation = validateWebPlayableTimeline(
      playableTimeline,
      options,
      shouldApplyReducedMotion
    );

    if (!validation.valid) {
      return createFailedWebPlayback(MotionPlaybackResultReasons.InvalidTimeline, [], {
        diagnostics: validation.diagnostics
      });
    }

    const resolvedPlayableTimeline = applyMotionTimelineDefaults(playableTimeline);

    const trackTargets = resolveWebTrackTargets(target, resolvedPlayableTimeline);

    if (!trackTargets) {
      return createFailedWebPlayback(MotionPlaybackResultReasons.TargetNotFound);
    }

    const conflictStrategy = getEffectiveWebConflictStrategy(options, this.options);

    if (conflictStrategy === 'ignore' && hasActiveWebAnimations(trackTargets)) {
      return createSkippedWebPlayback(MotionPlaybackResultReasons.MotionConflictIgnored);
    }

    if (conflictStrategy === 'replace') {
      cancelWebAnimations(trackTargets);
    }

    const animationCreation =
      scheduledTimeline !== undefined
        ? createWebAnimationsFromScheduledTimeline(target, scheduledTimeline)
        : createWebAnimationsFromTimeline(target, resolvedPlayableTimeline);

    if (!animationCreation.ok) {
      return createFailedWebPlayback(animationCreation.reason, animationCreation.animations);
    }

    if (
      this.hasInfinitePlayback(options, shouldApplyReducedMotion) ||
      hasInfiniteWebTimeline(resolvedPlayableTimeline)
    ) {
      return createRunningWebPlayback(animationCreation.animations);
    }

    return createFinishedWebPlayback(animationCreation.animations, diagnostics);
  }

  private hasInfinitePlayback(
    options: MotionPlayOptions,
    shouldApplyReducedMotion: boolean
  ): boolean {
    const summary = options.executionPlan?.summary;

    if (!summary) {
      return false;
    }

    if (shouldApplyReducedMotion && options.reducedMotionStrategy === 'simplify') {
      return summary.reducedMotionHasInfiniteDuration === true;
    }

    return summary.hasInfiniteDuration;
  }

  private createPlaybackId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `web_playback_${Date.now()}`;
  }
}
