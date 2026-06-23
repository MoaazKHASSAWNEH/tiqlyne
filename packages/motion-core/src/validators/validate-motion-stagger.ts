import { createMotionValidationDiagnostic as createErrorDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionStaggerDefinition } from '../models/motion-timeline';

export function validateStagger(
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
