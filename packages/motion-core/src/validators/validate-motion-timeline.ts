import { createMotionValidationDiagnostic as createErrorDiagnostic } from './create-motion-validation-diagnostic';
import { validateMotionEasing } from './validate-motion-easing';
import { validateTimelineLabels } from './validate-motion-labels';
import { validateStagger } from './validate-motion-stagger';
import { validateTarget } from './validate-motion-target';
import { validateKeyframe } from './validate-motion-keyframe';
import { validateStepPosition } from './validate-motion-step-position';
import { validatePlaybackTimingOptions } from './validate-motion-playback-options';
import { mergeMotionTimelineDefaults } from '../compiler/apply-motion-timeline-defaults';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionKeyframe } from '../models/motion-keyframe';
import type {
  MotionPlaybackDirection,
  MotionStepPosition,
  MotionTimelineDefaults,
  MotionTimelineDefinition,
  MotionTimelineLabels,
  MotionIterationCount,
  MotionFillMode
} from '../models/motion-timeline';
import type { MotionValidationResult } from '../models/motion-validation-result';
import { resolveMotionStepPosition } from '../compiler/resolve-motion-step-position';
import type { MotionEasing } from '../models/motion-easing';

type TrackSchedulingState = {
  cursor: number;
  previousStartTime?: number;
  previousEndTime?: number;
};

export function validateMotionTimeline(timeline: MotionTimelineDefinition): MotionValidationResult {
  const diagnostics: MotionDiagnostic[] = [];

  validateTimelineDefaults(timeline.defaults, diagnostics, 'timeline');
  validateTimelineLabels(timeline.labels, diagnostics);

  if (timeline.tracks.length === 0) {
    diagnostics.push(
      createErrorDiagnostic('timeline-empty-tracks', 'Timeline must contain at least one track.')
    );
  }

  timeline.tracks.forEach((track, trackIndex) => {
    validateTarget(track.target, trackIndex, diagnostics);
    validateStagger(track.stagger, trackIndex, diagnostics);
    validateTimelineDefaults(track.defaults, diagnostics, 'track', trackIndex);

    const trackDefaults = mergeMotionTimelineDefaults(timeline.defaults, track.defaults);

    if (track.steps.length === 0) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-empty-steps',
          'Timeline track must contain at least one step.',
          {
            trackIndex
          }
        )
      );
    }

    const schedulingState: TrackSchedulingState = {
      cursor: 0
    };

    track.steps.forEach((step, stepIndex) => {
      validateStep(step, trackDefaults, timeline.labels, trackIndex, stepIndex, diagnostics);
      validateFiniteStepScheduling(
        step,
        trackDefaults,
        timeline.labels,
        trackIndex,
        stepIndex,
        schedulingState,
        diagnostics
      );
    });
  });

  return {
    valid: diagnostics.every((diagnostic) => diagnostic.level !== 'error'),
    diagnostics
  };
}

function validateStep(
  step: {
    readonly at?: MotionStepPosition;
    readonly keyframes: ReadonlyArray<MotionKeyframe>;
    readonly duration?: number;
    readonly delay?: number;
    readonly easing?: MotionEasing;
    readonly offset?: number;
    readonly iterations?: MotionIterationCount;
    readonly direction?: MotionPlaybackDirection;
    readonly endDelay?: number;
    readonly playbackRate?: number;
    readonly fill?: MotionFillMode;
  },
  trackDefaults: MotionTimelineDefaults,
  labels: MotionTimelineLabels | undefined,
  trackIndex: number,
  stepIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  const metadata = {
    trackIndex,
    stepIndex
  };

  if (step.keyframes.length === 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-empty-keyframes',
        'Timeline step must contain at least one keyframe.',
        metadata
      )
    );
  }

  step.keyframes.forEach((keyframe, keyframeIndex) => {
    validateKeyframe(keyframe, trackIndex, stepIndex, keyframeIndex, diagnostics);
  });

  const duration = step.duration ?? trackDefaults.duration;

  if (duration === undefined || !Number.isFinite(duration) || duration < 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-duration',
        'Timeline step duration must be a finite non-negative number.',
        {
          ...metadata,
          duration: duration ?? null
        }
      )
    );
  }

  const delay = step.delay ?? trackDefaults.delay;

  if (delay !== undefined && (!Number.isFinite(delay) || delay < 0)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-delay',
        'Timeline step delay must be a finite non-negative number.',
        {
          ...metadata,
          delay
        }
      )
    );
  }

  validateStepPosition(step.at, labels, trackIndex, stepIndex, diagnostics);

  if (
    step.offset !== undefined &&
    (!Number.isFinite(step.offset) || step.offset < 0 || step.offset > 1)
  ) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-step-offset',
        'Timeline step offset must be between 0 and 1.',
        {
          ...metadata,
          offset: step.offset
        }
      )
    );
  }

  validateMotionEasing(
    step.easing ?? trackDefaults.easing,
    diagnostics,
    metadata,
    'timeline-invalid-easing',
    'Timeline step easing is invalid.'
  );

  const fill = step.fill ?? trackDefaults.fill;

  if (fill !== undefined && !isMotionFillMode(fill)) {
    diagnostics.push(
      createErrorDiagnostic('timeline-invalid-fill', 'Timeline step fill mode is invalid.', {
        ...metadata,
        fill
      })
    );
  }

  validatePlaybackTimingOptions(
    {
      iterations: step.iterations ?? trackDefaults.iterations,
      direction: step.direction ?? trackDefaults.direction,
      endDelay: step.endDelay ?? trackDefaults.endDelay,
      playbackRate: step.playbackRate ?? trackDefaults.playbackRate
    },
    diagnostics,
    metadata
  );
}

function validateTimelineDefaults(
  defaults: MotionTimelineDefaults | undefined,
  diagnostics: MotionDiagnostic[],
  source: 'timeline' | 'track',
  trackIndex?: number
): void {
  if (defaults === undefined) {
    return;
  }

  const metadata = {
    defaultSource: source,
    ...(trackIndex !== undefined
      ? {
          trackIndex
        }
      : {})
  };

  if (
    defaults.duration !== undefined &&
    (!Number.isFinite(defaults.duration) || defaults.duration < 0)
  ) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-default-duration',
        'Timeline default duration must be a finite non-negative number.',
        {
          ...metadata,
          duration: defaults.duration
        }
      )
    );
  }

  if (defaults.delay !== undefined && (!Number.isFinite(defaults.delay) || defaults.delay < 0)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-default-delay',
        'Timeline default delay must be a finite non-negative number.',
        {
          ...metadata,
          delay: defaults.delay
        }
      )
    );
  }

  validateMotionEasing(
    defaults.easing,
    diagnostics,
    metadata,
    'timeline-invalid-default-easing',
    'Timeline default easing is invalid.'
  );

  if (defaults.fill !== undefined && !isMotionFillMode(defaults.fill)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-default-fill',
        'Timeline default fill mode is invalid.',
        {
          ...metadata,
          fill: defaults.fill
        }
      )
    );
  }

  validatePlaybackTimingOptions(
    {
      iterations: defaults.iterations,
      direction: defaults.direction,
      endDelay: defaults.endDelay,
      playbackRate: defaults.playbackRate
    },
    diagnostics,
    metadata
  );
}

function isMotionFillMode(value: unknown): value is MotionFillMode {
  return (
    value === 'none' ||
    value === 'forwards' ||
    value === 'backwards' ||
    value === 'both' ||
    value === 'auto'
  );
}

function validateFiniteStepScheduling(
  step: {
    readonly at?: MotionStepPosition;
    readonly duration?: number;
    readonly delay?: number;
    readonly iterations?: MotionIterationCount;
    readonly endDelay?: number;
  },
  trackDefaults: MotionTimelineDefaults,
  labels: MotionTimelineLabels | undefined,
  trackIndex: number,
  stepIndex: number,
  state: TrackSchedulingState,
  diagnostics: MotionDiagnostic[]
): void {
  const delay = step.delay ?? trackDefaults.delay ?? 0;
  const duration = step.duration ?? trackDefaults.duration ?? 0;
  const iterations = step.iterations ?? trackDefaults.iterations ?? 1;
  const endDelay = step.endDelay ?? trackDefaults.endDelay ?? 0;

  const baseStartTime = resolveMotionStepPosition(step.at, labels, state.cursor, {
    ...(state.previousStartTime !== undefined
      ? {
          previousStartTime: state.previousStartTime
        }
      : {}),
    ...(state.previousEndTime !== undefined
      ? {
          previousEndTime: state.previousEndTime
        }
      : {})
  });

  const startTime = baseStartTime + delay;

  if (!Number.isFinite(startTime)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-unreachable-step',
        'Timeline step cannot be scheduled because its position depends on an infinite duration.',
        {
          trackIndex,
          stepIndex,
          reason: getUnreachableStepReason(step.at)
        }
      )
    );
  }

  const activeDuration = iterations === 'infinite' ? Infinity : duration * iterations + endDelay;
  const endTime = startTime + activeDuration;

  state.cursor = Math.max(state.cursor, endTime);
  state.previousStartTime = startTime;
  state.previousEndTime = endTime;
}

function getUnreachableStepReason(position: MotionStepPosition | undefined): string {
  if (position === undefined) {
    return 'implicit-position-after-infinite-duration';
  }

  if (typeof position === 'object' && 'anchor' in position) {
    if (position.anchor === 'track-end') {
      return 'track-end-after-infinite-duration';
    }

    if (position.anchor === 'previous-end') {
      return 'previous-end-after-infinite-duration';
    }
  }

  return 'position-resolved-to-infinite-time';
}
