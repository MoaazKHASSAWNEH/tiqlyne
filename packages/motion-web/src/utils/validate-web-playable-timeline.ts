import {
  validateMotionTimeline,
  type MotionDiagnostic,
  type MotionPlayOptions,
  type MotionTimelineDefinition
} from '@structifyx/motion-core';

export type WebPlayableTimelineValidationResult =
  | {
      readonly valid: true;
      readonly diagnostics: ReadonlyArray<MotionDiagnostic>;
    }
  | {
      readonly valid: false;
      readonly diagnostics: ReadonlyArray<MotionDiagnostic>;
    };

export function shouldValidateWebPlayableTimeline(
  options: MotionPlayOptions,
  shouldApplyReducedMotion: boolean
): boolean {
  return shouldApplyReducedMotion && options.reducedMotionStrategy === 'simplify'
    ? options.reducedMotionTimelineValidated !== true
    : options.timelineValidated !== true;
}

export function validateWebPlayableTimeline(
  timeline: MotionTimelineDefinition,
  options: MotionPlayOptions,
  shouldApplyReducedMotion: boolean
): WebPlayableTimelineValidationResult {
  if (!shouldValidateWebPlayableTimeline(options, shouldApplyReducedMotion)) {
    return {
      valid: true,
      diagnostics: []
    };
  }

  return validateMotionTimeline(timeline);
}
