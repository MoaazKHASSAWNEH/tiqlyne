import {
  MotionPlaybackResultReasons,
  type MotionPlaybackResult,
  type MotionPlaybackResultReason
} from '@structifyx/motion-core';
import type { WebPlaybackCreationResult } from '../models/web-playback-creation-result';

export function createResolvedWebPlayback(
  result: MotionPlaybackResult,
  animations: ReadonlyArray<Animation> = []
): WebPlaybackCreationResult {
  return {
    animations,
    finished: Promise.resolve(result)
  };
}

export function createRunningWebPlayback(
  animations: ReadonlyArray<Animation>,
  reason: MotionPlaybackResultReason | string = MotionPlaybackResultReasons.WebPlaybackInfinite
): WebPlaybackCreationResult {
  return {
    animations,
    finished: Promise.resolve({
      status: 'running',
      reason
    })
  };
}

export function createFinishedWebPlayback(
  animations: ReadonlyArray<Animation>,
  diagnostics: MotionPlaybackResult['diagnostics'] = []
): WebPlaybackCreationResult {
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
          reason: MotionPlaybackResultReasons.WebAnimationError,
          error
        })
      )
  };
}

export function createFailedWebPlayback(
  reason: MotionPlaybackResultReason | string,
  animations: ReadonlyArray<Animation> = [],
  extra: Omit<MotionPlaybackResult, 'status' | 'reason'> = {}
): WebPlaybackCreationResult {
  return createResolvedWebPlayback(
    {
      status: 'failed',
      reason,
      ...extra
    },
    animations
  );
}

export function createSkippedWebPlayback(
  reason: MotionPlaybackResultReason | string,
  animations: ReadonlyArray<Animation> = []
): WebPlaybackCreationResult {
  return createResolvedWebPlayback(
    {
      status: 'skipped',
      reason
    },
    animations
  );
}
