import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionKeyframe } from '../models/motion-keyframe';
import type { MotionTargetReference } from '../models/motion-target';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import type { MotionValidationResult } from '../models/motion-validation-result';

export function validateMotionTimeline(timeline: MotionTimelineDefinition): MotionValidationResult {
  const diagnostics: MotionDiagnostic[] = [];

  if (timeline.tracks.length === 0) {
    diagnostics.push(
      createErrorDiagnostic('timeline-empty-tracks', 'Timeline must contain at least one track.')
    );
  }

  timeline.tracks.forEach((track, trackIndex) => {
    validateTarget(track.target, trackIndex, diagnostics);

    if (track.stagger !== undefined && (!Number.isFinite(track.stagger) || track.stagger < 0)) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-invalid-stagger',
          'Timeline track stagger must be a finite non-negative number.',
          {
            trackIndex,
            stagger: track.stagger
          }
        )
      );
    }

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
      if (step.keyframes.length === 0) {
        diagnostics.push(
          createErrorDiagnostic(
            'timeline-empty-keyframes',
            'Timeline step must contain at least one keyframe.',
            {
              trackIndex,
              stepIndex
            }
          )
        );
      }

      step.keyframes.forEach((keyframe, keyframeIndex) => {
        validateKeyframe(keyframe, trackIndex, stepIndex, keyframeIndex, diagnostics);
      });

      if (!Number.isFinite(step.duration) || step.duration < 0) {
        diagnostics.push(
          createErrorDiagnostic(
            'timeline-invalid-duration',
            'Timeline step duration must be a finite positive number.',
            {
              trackIndex,
              stepIndex,
              duration: step.duration
            }
          )
        );
      }

      if (step.delay !== undefined && (!Number.isFinite(step.delay) || step.delay < 0)) {
        diagnostics.push(
          createErrorDiagnostic(
            'timeline-invalid-delay',
            'Timeline step delay must be a finite positive number.',
            {
              trackIndex,
              stepIndex,
              delay: step.delay
            }
          )
        );
      }

      if (
        step.offset !== undefined &&
        (!Number.isFinite(step.offset) || step.offset < 0 || step.offset > 1)
      ) {
        diagnostics.push(
          createErrorDiagnostic(
            'timeline-invalid-step-offset',
            'Timeline step offset must be between 0 and 1.',
            {
              trackIndex,
              stepIndex,
              offset: step.offset
            }
          )
        );
      }

      if (step.easing !== undefined && step.easing.trim().length === 0) {
        diagnostics.push(
          createErrorDiagnostic(
            'timeline-invalid-easing',
            'Timeline step easing must not be empty.',
            {
              trackIndex,
              stepIndex
            }
          )
        );
      }
    });
  });

  return {
    valid: diagnostics.every((diagnostic) => diagnostic.level !== 'error'),
    diagnostics
  };
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
  metadata?: Record<string, string | number | boolean | null>
): MotionDiagnostic {
  return {
    level: 'error',
    code,
    message,
    source: 'motion-timeline-validator',
    ...(metadata !== undefined ? { metadata } : {})
  };
}
