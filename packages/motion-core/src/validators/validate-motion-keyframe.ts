import { createMotionValidationDiagnostic as createErrorDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionKeyframe } from '../models/motion-keyframe';
import { validateMotionTransform } from './validate-motion-transform';
import { validateMotionFilter } from './validate-motion-filter';
import { validateKeyframePerformance } from './validate-motion-keyframe-performance';
import type { MotionPerformanceDiagnosticsOptions } from '../models/motion-validation-options';

export function validateKeyframe(
  keyframe: MotionKeyframe,
  trackIndex: number,
  stepIndex: number,
  keyframeIndex: number,
  diagnostics: MotionDiagnostic[],
  performanceDiagnosticsOptions?: MotionPerformanceDiagnosticsOptions
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

  validateMotionTransform(keyframe.transform, diagnostics, {
    trackIndex,
    stepIndex,
    keyframeIndex
  });

  validateMotionFilter(keyframe.filter, diagnostics, {
    trackIndex,
    stepIndex,
    keyframeIndex
  });

  validateKeyframePerformance(
    keyframe,
    diagnostics,
    {
      trackIndex,
      stepIndex,
      keyframeIndex
    },
    performanceDiagnosticsOptions
  );

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
