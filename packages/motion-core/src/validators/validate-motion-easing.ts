import { createMotionValidationDiagnostic as createErrorDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic, MotionDiagnosticMetadata } from '../models/motion-diagnostic';
import { isRecord } from '../utils/is-record';

const MOTION_EASING_KEYWORDS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'] as const;

const MOTION_STEPS_EASING_POSITIONS = ['start', 'end'] as const;

export function validateMotionEasing(
  easing: unknown,
  diagnostics: MotionDiagnostic[],
  metadata: MotionDiagnosticMetadata,
  code: string,
  message: string
): void {
  if (easing === undefined) {
    return;
  }

  if (typeof easing === 'string') {
    validateEasingKeyword(easing, diagnostics, metadata, code, message);
    return;
  }

  if (!isRecord(easing)) {
    diagnostics.push(createErrorDiagnostic(code, message, metadata));
    return;
  }

  switch (easing.type) {
    case 'cubicBezier':
      validateCubicBezierEasing(easing, diagnostics, metadata, code, message);
      return;

    case 'steps':
      validateStepsEasing(easing, diagnostics, metadata, code, message);
      return;

    default:
      diagnostics.push(
        createErrorDiagnostic(code, message, {
          ...metadata,
          easingType: typeof easing.type === 'string' ? easing.type : null
        })
      );
  }
}

function validateEasingKeyword(
  easing: string,
  diagnostics: MotionDiagnostic[],
  metadata: MotionDiagnosticMetadata,
  code: string,
  message: string
): void {
  if (!MOTION_EASING_KEYWORDS.includes(easing as never)) {
    diagnostics.push(
      createErrorDiagnostic(code, message, {
        ...metadata,
        easing
      })
    );
  }
}

function validateCubicBezierEasing(
  easing: Record<string, unknown>,
  diagnostics: MotionDiagnostic[],
  metadata: MotionDiagnosticMetadata,
  code: string,
  message: string
): void {
  validateCubicBezierXValue(easing.x1, 'x1', diagnostics, metadata, code, message);
  validateCubicBezierYValue(easing.y1, 'y1', diagnostics, metadata, code, message);
  validateCubicBezierXValue(easing.x2, 'x2', diagnostics, metadata, code, message);
  validateCubicBezierYValue(easing.y2, 'y2', diagnostics, metadata, code, message);
}

function validateCubicBezierXValue(
  value: unknown,
  field: 'x1' | 'x2',
  diagnostics: MotionDiagnostic[],
  metadata: MotionDiagnosticMetadata,
  code: string,
  message: string
): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    diagnostics.push(
      createErrorDiagnostic(code, message, {
        ...metadata,
        easingType: 'cubicBezier',
        easingField: field,
        easingValue: typeof value === 'number' && Number.isFinite(value) ? value : null
      })
    );
  }
}

function validateCubicBezierYValue(
  value: unknown,
  field: 'y1' | 'y2',
  diagnostics: MotionDiagnostic[],
  metadata: MotionDiagnosticMetadata,
  code: string,
  message: string
): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    diagnostics.push(
      createErrorDiagnostic(code, message, {
        ...metadata,
        easingType: 'cubicBezier',
        easingField: field,
        easingValue: typeof value === 'number' && Number.isFinite(value) ? value : null
      })
    );
  }
}

function validateStepsEasing(
  easing: Record<string, unknown>,
  diagnostics: MotionDiagnostic[],
  metadata: MotionDiagnosticMetadata,
  code: string,
  message: string
): void {
  if (typeof easing.count !== 'number' || !Number.isInteger(easing.count) || easing.count <= 0) {
    diagnostics.push(
      createErrorDiagnostic(code, message, {
        ...metadata,
        easingType: 'steps',
        easingField: 'count',
        easingValue:
          typeof easing.count === 'number' && Number.isFinite(easing.count) ? easing.count : null
      })
    );
  }

  if (
    easing.position !== undefined &&
    !MOTION_STEPS_EASING_POSITIONS.includes(easing.position as never)
  ) {
    diagnostics.push(
      createErrorDiagnostic(code, message, {
        ...metadata,
        easingType: 'steps',
        easingField: 'position',
        easingValue: typeof easing.position === 'string' ? easing.position : null
      })
    );
  }
}
