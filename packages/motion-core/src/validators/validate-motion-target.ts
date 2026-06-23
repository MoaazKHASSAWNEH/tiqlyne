import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionTargetReference } from '../models/motion-target';

type ValidationMetadata = Record<string, string | number | boolean | null>;

export function validateTarget(
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
