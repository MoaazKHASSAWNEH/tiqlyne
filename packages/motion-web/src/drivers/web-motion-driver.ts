import {
  validateMotionTimeline,
  type MotionDiagnostic,
  type MotionDriver,
  type MotionPlayOptions,
  type MotionPlaybackResult,
  type MotionPlaybackController,
  type MotionTimelineDefinition,
  type MotionKeyframe,
  type MotionConflictStrategy
} from '@structifyx/motion-core';
import { toWebKeyframes } from '../utils/to-web-keyframes';
import { WebMotionPlaybackController } from '../controllers/web-motion-playback-controller';

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

  private resolveTrackTargets(
    root: Element,
    timeline: MotionTimelineDefinition
  ): ReadonlyArray<Element> | null {
    const targets: Element[] = [];

    for (const track of timeline.tracks) {
      const target = this.resolveTarget(root, track.target);

      if (!target) {
        return null;
      }

      targets.push(target);
    }

    return targets;
  }

  private cancelAnimations(targets: ReadonlyArray<Element>): void {
    for (const target of targets) {
      target.getAnimations({ subtree: true }).forEach((animation) => {
        animation.cancel();
      });
    }
  }

  private resolveTarget(root: Element, target: TimelineTargetReference): Element | null {
    switch (target.type) {
      case 'self':
        return root;

      case 'child':
        return root.querySelector(`[data-motion-child="${target.name}"]`);

      case 'selector':
        return root.querySelector(target.selector);

      case 'named':
        return document.querySelector(`[data-motion-name="${target.name}"]`);
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
  ): {
    readonly animations: ReadonlyArray<Animation>;
    readonly finished: Promise<MotionPlaybackResult>;
  } {
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

    const shouldUseGenericReducedMotionFallback =
      shouldApplyReducedMotion &&
      options.reducedMotionStrategy === 'simplify' &&
      options.reducedMotionTimeline === undefined;

    const diagnostics = shouldUseGenericReducedMotionFallback
      ? [this.createGenericReducedMotionFallbackDiagnostic()]
      : [];

    const playableTimeline =
      shouldApplyReducedMotion && options.reducedMotionStrategy === 'simplify'
        ? (options.reducedMotionTimeline ?? this.simplifyTimeline(timeline))
        : timeline;

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

    const trackTargets = this.resolveTrackTargets(target, playableTimeline);

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

    for (const track of playableTimeline.tracks) {
      const trackTarget = this.resolveTarget(target, track.target);

      if (!trackTarget) {
        return {
          animations,
          finished: Promise.resolve({
            status: 'failed',
            reason: 'target-not-found'
          })
        };
      }

      for (const step of track.steps) {
        const animation = trackTarget.animate(toWebKeyframes(step.keyframes), {
          duration: step.duration,
          delay: step.delay ?? 0,
          easing: step.easing ?? 'ease',
          fill: step.fill ?? 'both'
        });

        animations.push(animation);
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

type TimelineTargetReference = MotionTimelineDefinition['tracks'][number]['target'];
