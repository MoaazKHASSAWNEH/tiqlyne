import {
  type MotionDriver,
  type MotionPlayOptions,
  type MotionPlaybackResult,
  type MotionPlaybackController,
  type MotionTimelineDefinition
} from '@structifyx/motion-core';
import { WebMotionPlaybackController } from '../controllers/web-motion-playback-controller';
import { resolveWebTargets, resolveWebTrackTargets } from '../utils/resolve-web-targets';
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
import {
  cancelWebAnimations,
  getEffectiveWebConflictStrategy,
  hasActiveWebAnimations
} from '../utils/resolve-web-conflict';
import {
  createWebAnimationsFromScheduledTimeline,
  createWebAnimationsFromTimeline
} from '../utils/create-web-timeline-animations';
import { validateWebPlayableTimeline } from '../utils/validate-web-playable-timeline';

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

    const validation = validateWebPlayableTimeline(
      playableTimeline,
      options,
      shouldApplyReducedMotion
    );

    if (!validation.valid) {
      return createFailedWebPlayback('invalid-timeline', [], {
        diagnostics: validation.diagnostics
      });
    }

    const trackTargets = resolveWebTrackTargets(target, playableTimeline);

    if (!trackTargets) {
      return createFailedWebPlayback('target-not-found');
    }

    const conflictStrategy = getEffectiveWebConflictStrategy(options, this.options);

    if (conflictStrategy === 'ignore' && hasActiveWebAnimations(trackTargets)) {
      return createSkippedWebPlayback('motion-conflict-ignored');
    }

    if (conflictStrategy === 'replace') {
      cancelWebAnimations(trackTargets);
    }

    const animationCreation =
      scheduledTimeline !== undefined
        ? createWebAnimationsFromScheduledTimeline(target, scheduledTimeline)
        : createWebAnimationsFromTimeline(target, playableTimeline);

    if (!animationCreation.ok) {
      return createFailedWebPlayback(animationCreation.reason, animationCreation.animations);
    }

    return createFinishedWebPlayback(animationCreation.animations, diagnostics);
  }

  private createPlaybackId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `web_playback_${Date.now()}`;
  }
}
