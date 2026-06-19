import type {
  MotionDriver,
  MotionPlayOptions,
  MotionPlaybackResult,
  MotionTimelineDefinition
} from '@structifyx/motion-core';
import { toWebKeyframes } from '../utils/to-web-keyframes';

export type WebMotionDriverOptions = {
  readonly reducedMotion?: boolean;
};

export class WebMotionDriver implements MotionDriver<Element> {
  readonly name = 'web';

  constructor(private readonly options: WebMotionDriverOptions = {}) {}

  async play(
    target: Element,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult> {
    if (options.respectReducedMotion && this.options.reducedMotion === true) {
      return {
        status: 'skipped',
        reason: 'reduced-motion'
      };
    }

    const animations: Animation[] = [];

    for (const track of timeline.tracks) {
      const trackTarget = this.resolveTarget(target, track.target);

      if (!trackTarget) {
        return {
          status: 'failed',
          reason: 'target-not-found'
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

    try {
      await Promise.all(animations.map((animation) => animation.finished));

      return {
        status: 'finished'
      };
    } catch (error: unknown) {
      return {
        status: 'failed',
        reason: 'web-animation-error',
        error
      };
    }
  }

  private resolveTarget(
    root: Element,
    target: TimelineTargetReference
  ): Element | null {
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
}

type TimelineTargetReference = MotionTimelineDefinition['tracks'][number]['target'];