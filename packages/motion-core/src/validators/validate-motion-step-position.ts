import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type {
  MotionAnchorStepPosition,
  MotionStepAnchor,
  MotionStepPosition,
  MotionTimelineLabels
} from '../models/motion-timeline';

type ValidationMetadata = Record<string, string | number | boolean | null>;

export function validateStepPosition(
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
