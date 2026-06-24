import { createMotionValidationDiagnostic as createErrorDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionTargetReference } from '../models/motion-target';
import { isRecord } from '../utils/is-record';

export function validateTarget(
  target: MotionTargetReference,
  trackIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  if (!isRecord(target)) {
    diagnostics.push(
      createErrorDiagnostic('timeline-invalid-target', 'Timeline target must be an object.', {
        trackIndex
      })
    );

    return;
  }

  const rawTarget: Record<string, unknown> = target;
  const targetType = rawTarget.type;

  switch (targetType) {
    case 'self':
      return;

    case 'child':
    case 'named':
      validateNamedTarget(rawTarget, trackIndex, diagnostics);
      return;

    case 'selector':
      validateSelectorTarget(rawTarget, trackIndex, diagnostics);
      return;

    default:
      diagnostics.push(
        createErrorDiagnostic('timeline-invalid-target-type', 'Timeline target type is invalid.', {
          trackIndex,
          targetType: typeof targetType === 'string' ? targetType : null
        })
      );
  }
}

function validateNamedTarget(
  target: Record<string, unknown>,
  trackIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  const targetType = typeof target.type === 'string' ? target.type : null;

  if (typeof target.name !== 'string' || target.name.trim().length === 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-target-name',
        'Timeline target name must be a non-empty string.',
        {
          trackIndex,
          targetType
        }
      )
    );
  }
}

function validateSelectorTarget(
  target: Record<string, unknown>,
  trackIndex: number,
  diagnostics: MotionDiagnostic[]
): void {
  if (typeof target.selector !== 'string' || target.selector.trim().length === 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-target-selector',
        'Timeline target selector must be a non-empty string.',
        {
          trackIndex
        }
      )
    );
  }
}
