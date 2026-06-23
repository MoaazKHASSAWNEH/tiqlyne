import { mergeMotionTimelineDefaults } from '../compiler/apply-motion-timeline-defaults';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionKeyframe } from '../models/motion-keyframe';
import type { MotionTargetReference } from '../models/motion-target';
import type {
  MotionAnchorStepPosition,
  MotionPlaybackDirection,
  MotionStepAnchor,
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

function validatePlaybackTimingOptions(
  options: {
    readonly iterations: number | undefined;
    readonly direction: MotionPlaybackDirection | undefined;
    readonly endDelay: number | undefined;
    readonly playbackRate: number | undefined;
  },
  diagnostics: MotionDiagnostic[],
  metadata: ValidationMetadata
): void {
  validateIterations(options.iterations, diagnostics, metadata);
  validatePlaybackDirection(options.direction, diagnostics, metadata);
  validateEndDelay(options.endDelay, diagnostics, metadata);
  validatePlaybackRate(options.playbackRate, diagnostics, metadata);
}

function validateIterations(
  iterations: number | undefined,
  diagnostics: MotionDiagnostic[],
  metadata: ValidationMetadata
): void {
  if (iterations === undefined) {
    return;
  }

  if (!Number.isFinite(iterations) || iterations <= 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-iterations',
        'Timeline iterations must be a finite positive number.',
        {
          ...metadata,
          iterations
        }
      )
    );
  }
}

function validatePlaybackDirection(
  direction: MotionPlaybackDirection | undefined,
  diagnostics: MotionDiagnostic[],
  metadata: ValidationMetadata
): void {
  if (direction === undefined) {
    return;
  }

  if (!isMotionPlaybackDirection(direction)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-direction',
        'Timeline direction must be normal, reverse, alternate or alternate-reverse.',
        {
          ...metadata,
          direction
        }
      )
    );
  }
}

function validateEndDelay(
  endDelay: number | undefined,
  diagnostics: MotionDiagnostic[],
  metadata: ValidationMetadata
): void {
  if (endDelay === undefined) {
    return;
  }

  if (!Number.isFinite(endDelay) || endDelay < 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-end-delay',
        'Timeline endDelay must be a finite non-negative number.',
        {
          ...metadata,
          endDelay
        }
      )
    );
  }
}

function validatePlaybackRate(
  playbackRate: number | undefined,
  diagnostics: MotionDiagnostic[],
  metadata: ValidationMetadata
): void {
  if (playbackRate === undefined) {
    return;
  }

  if (!Number.isFinite(playbackRate) || playbackRate <= 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-playback-rate',
        'Timeline playbackRate must be a finite positive number.',
        {
          ...metadata,
          playbackRate
        }
      )
    );
  }
}

function isMotionPlaybackDirection(direction: MotionPlaybackDirection): boolean {
  return (
    direction === 'normal' ||
    direction === 'reverse' ||
    direction === 'alternate' ||
    direction === 'alternate-reverse'
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

function validateStepPosition(
  position: MotionStepPosition | undefined,
  labels: MotionTimelineLabels | undefined,
  trackIndex: number,
  stepIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  if (position === undefined) {
    return;
  }

  if (typeof position === 'number') {
    if (!Number.isFinite(position) || position < 0) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-invalid-step-position',
          'Timeline step position must be a finite non-negative number.',
          {
            trackIndex,
            stepIndex,
            at: position
          }
        )
      );
    }

    return;
  }

  if (typeof position === 'string') {
    validateStepLabelPosition(position, labels, trackIndex, stepIndex, diagnostics);

    return;
  }

  if ('label' in position) {
    validateStepLabelStepPosition(position, labels, trackIndex, stepIndex, diagnostics);

    return;
  }

  validateAnchorStepPosition(position, trackIndex, stepIndex, diagnostics);
}

function validateStepLabelStepPosition(
  position: {
    readonly label: string;
    readonly offset?: number;
  },
  labels: MotionTimelineLabels | undefined,
  trackIndex: number,
  stepIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  validateStepLabelPosition(position.label, labels, trackIndex, stepIndex, diagnostics);

  if (position.offset !== undefined && !Number.isFinite(position.offset)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-step-position-offset',
        'Timeline step position offset must be a finite number.',
        {
          trackIndex,
          stepIndex,
          offset: position.offset
        }
      )
    );
  }

  const labelPosition = labels?.[position.label];
  const offset = position.offset ?? 0;

  if (labelPosition !== undefined && Number.isFinite(labelPosition) && labelPosition + offset < 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-step-position',
        'Timeline step position must resolve to a finite non-negative number.',
        {
          trackIndex,
          stepIndex,
          at: labelPosition + offset
        }
      )
    );
  }
}

function validateStepLabelPosition(
  label: string,
  labels: MotionTimelineLabels | undefined,
  trackIndex: number,
  stepIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  if (label.trim().length === 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-step-label',
        'Timeline step label position must not be empty.',
        {
          trackIndex,
          stepIndex,
          at: label
        }
      )
    );

    return;
  }

  if (labels?.[label] === undefined) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-unknown-step-label',
        'Timeline step references an unknown label.',
        {
          trackIndex,
          stepIndex,
          at: label
        }
      )
    );
  }
}

function validateAnchorStepPosition(
  position: MotionAnchorStepPosition,
  trackIndex: number,
  stepIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  if (!isMotionStepAnchor(position.anchor)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-step-anchor',
        'Timeline step anchor must be track-start, track-end, previous-start or previous-end.',
        {
          trackIndex,
          stepIndex,
          anchor: position.anchor
        }
      )
    );

    return;
  }

  if (position.offset !== undefined && !Number.isFinite(position.offset)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-step-position-offset',
        'Timeline step position offset must be a finite number.',
        {
          trackIndex,
          stepIndex,
          offset: position.offset
        }
      )
    );
  }

  if (
    (position.anchor === 'previous-start' || position.anchor === 'previous-end') &&
    stepIndex === 0
  ) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-step-anchor',
        'Timeline previous step anchors cannot be used on the first step of a track.',
        {
          trackIndex,
          stepIndex,
          anchor: position.anchor
        }
      )
    );
  }

  if (position.anchor === 'track-start' && (position.offset ?? 0) < 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-step-position',
        'Timeline step position must resolve to a finite non-negative number.',
        {
          trackIndex,
          stepIndex,
          at: position.offset ?? 0
        }
      )
    );
  }
}

function isMotionStepAnchor(anchor: MotionStepAnchor): boolean {
  return (
    anchor === 'track-start' ||
    anchor === 'track-end' ||
    anchor === 'previous-start' ||
    anchor === 'previous-end'
  );
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

function validateTarget(
  target: MotionTargetReference,
  trackIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  switch (target.type) {
    case 'self':
      return;

    case 'child':
    case 'named':
      if (target.name.trim().length === 0) {
        diagnostics.push(
          createErrorDiagnostic(
            'timeline-invalid-target-name',
            'Timeline target name must not be empty.',
            {
              trackIndex,
              targetType: target.type
            }
          )
        );
      }

      return;

    case 'selector':
      if (target.selector.trim().length === 0) {
        diagnostics.push(
          createErrorDiagnostic(
            'timeline-invalid-target-selector',
            'Timeline target selector must not be empty.',
            {
              trackIndex
            }
          )
        );
      }

      return;
  }
}

function validateKeyframe(
  keyframe: MotionKeyframe,
  trackIndex: number,
  stepIndex: number,
  keyframeIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  if (
    keyframe.opacity !== undefined &&
    (!Number.isFinite(keyframe.opacity) || keyframe.opacity < 0 || keyframe.opacity > 1)
  ) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-opacity',
        'Keyframe opacity must be between 0 and 1.',
        {
          trackIndex,
          stepIndex,
          keyframeIndex,
          opacity: keyframe.opacity
        }
      )
    );
  }

  if (
    keyframe.offset !== undefined &&
    (!Number.isFinite(keyframe.offset) || keyframe.offset < 0 || keyframe.offset > 1)
  ) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-keyframe-offset',
        'Keyframe offset must be between 0 and 1.',
        {
          trackIndex,
          stepIndex,
          keyframeIndex,
          offset: keyframe.offset
        }
      )
    );
  }

  if (keyframe.custom !== undefined) {
    for (const [property, value] of Object.entries(keyframe.custom)) {
      if (property.trim().length === 0) {
        diagnostics.push(
          createErrorDiagnostic(
            'timeline-invalid-custom-property',
            'Custom keyframe property name must not be empty.',
            {
              trackIndex,
              stepIndex,
              keyframeIndex
            }
          )
        );
      }

      if (typeof value === 'number' && !Number.isFinite(value)) {
        diagnostics.push(
          createErrorDiagnostic(
            'timeline-invalid-custom-value',
            'Custom keyframe numeric value must be finite.',
            {
              trackIndex,
              stepIndex,
              keyframeIndex,
              property
            }
          )
        );
      }
    }
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
