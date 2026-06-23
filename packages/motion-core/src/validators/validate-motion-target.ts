import { createMotionValidationDiagnostic as createErrorDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionTargetReference } from '../models/motion-target';

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
