import { createMotionValidationDiagnostic as createErrorDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionTimelineLabels } from '../models/motion-timeline';

export function validateTimelineLabels(
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
