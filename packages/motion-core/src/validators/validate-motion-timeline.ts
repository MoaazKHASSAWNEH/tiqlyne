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
  MotionStaggerDefinition,
  MotionTimelineDefaults,
  MotionTimelineDefinition,
  MotionTimelineLabels
} from '../models/motion-timeline';
import type { MotionValidationResult } from '../models/motion-validation-result';

type ValidationMetadata = Record<string, string | number | boolean | null>;

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

    track.steps.forEach((step, stepIndex) => {
      validateStep(step, trackDefaults, timeline.labels, trackIndex, stepIndex, diagnostics);
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
    readonly easing?: string;
    readonly offset?: number;
    readonly iterations?: number;
    readonly direction?: MotionPlaybackDirection;
    readonly endDelay?: number;
    readonly playbackRate?: number;
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

  const easing = step.easing ?? trackDefaults.easing;

  if (easing !== undefined && easing.trim().length === 0) {
    diagnostics.push(
      createErrorDiagnostic('timeline-invalid-easing', 'Timeline step easing must not be empty.', {
        ...metadata
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

  if (defaults.easing !== undefined && defaults.easing.trim().length === 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-default-easing',
        'Timeline default easing must not be empty.',
        metadata
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

function validateStagger(
  stagger: MotionStaggerDefinition | undefined,
  trackIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  if (stagger === undefined) {
    return;
  }

  if (typeof stagger === 'number') {
    validateStaggerValue(stagger, trackIndex, diagnostics);

    return;
  }

  validateStaggerValue(stagger.each, trackIndex, diagnostics);

  if (
    stagger.from !== undefined &&
    stagger.from !== 'start' &&
    stagger.from !== 'end' &&
    stagger.from !== 'center'
  ) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-stagger-from',
        'Timeline track stagger from must be start, end or center.',
        {
          trackIndex,
          from: stagger.from
        }
      )
    );
  }
}

function validateTimelineLabels(
  labels: MotionTimelineLabels | undefined,
  diagnostics: MotionDiagnostic[]
): void {
  if (labels === undefined) {
    return;
  }

  for (const [label, position] of Object.entries(labels)) {
    if (label.trim().length === 0) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-invalid-label-name',
          'Timeline label name must not be empty.',
          {
            label
          }
        )
      );
    }

    if (!Number.isFinite(position) || position < 0) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-invalid-label-position',
          'Timeline label position must be a finite non-negative number.',
          {
            label,
            position
          }
        )
      );
    }
  }
}

function validateStaggerValue(
  stagger: number,
  trackIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  if (!Number.isFinite(stagger) || stagger < 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-stagger',
        'Timeline track stagger must be a finite non-negative number.',
        {
          trackIndex,
          stagger
        }
      )
    );
  }
}

function createErrorDiagnostic(
  code: string,
  message: string,
  metadata?: ValidationMetadata
): MotionDiagnostic {
  return {
    level: 'error',
    code,
    message,
    source: 'motion-timeline-validator',
    ...(metadata !== undefined ? { metadata } : {})
  };
}
