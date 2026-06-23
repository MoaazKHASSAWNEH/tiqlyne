import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionKeyframe } from '../models/motion-keyframe';

type ValidationMetadata = Record<string, string | number | boolean | null>;

export function validateKeyframe(
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
