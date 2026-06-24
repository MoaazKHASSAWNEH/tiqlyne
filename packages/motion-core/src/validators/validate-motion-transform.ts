import { createMotionValidationDiagnostic as createErrorDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import { isRecord } from '../utils/is-record';

const LENGTH_PROPERTIES = [
  'x',
  'y',
  'z',
  'translateX',
  'translateY',
  'translateZ',
  'perspective'
] as const;

const SCALE_PROPERTIES = ['scale', 'scaleX', 'scaleY', 'scaleZ'] as const;

const ANGLE_PROPERTIES = ['rotate', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY'] as const;

type TransformValidationMetadata = {
  readonly trackIndex: number;
  readonly stepIndex: number;
  readonly keyframeIndex: number;
};

export function validateMotionTransform(
  transform: unknown,
  diagnostics: MotionDiagnostic[],
  metadata: TransformValidationMetadata
): void {
  if (transform === undefined) {
    return;
  }

  if (typeof transform === 'string') {
    if (transform.trim().length === 0) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-invalid-transform',
          'Keyframe transform must be a non-empty string or a structured transform object.',
          metadata
        )
      );
    }

    return;
  }

  if (!isRecord(transform)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-transform',
        'Keyframe transform must be a non-empty string or a structured transform object.',
        metadata
      )
    );

    return;
  }

  validateLengthProperties(transform, diagnostics, metadata);
  validateScaleProperties(transform, diagnostics, metadata);
  validateAngleProperties(transform, diagnostics, metadata);
  validateOrigin(transform.origin, diagnostics, metadata);
}

function validateLengthProperties(
  transform: Record<string, unknown>,
  diagnostics: MotionDiagnostic[],
  metadata: TransformValidationMetadata
): void {
  for (const property of LENGTH_PROPERTIES) {
    const value = transform[property];

    if (value === undefined) {
      continue;
    }

    if (!isValidLengthValue(value)) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-invalid-transform-value',
          'Transform length value must be a finite number or a non-empty string.',
          {
            ...metadata,
            transformProperty: property
          }
        )
      );
    }
  }
}

function validateScaleProperties(
  transform: Record<string, unknown>,
  diagnostics: MotionDiagnostic[],
  metadata: TransformValidationMetadata
): void {
  for (const property of SCALE_PROPERTIES) {
    const value = transform[property];

    if (value === undefined) {
      continue;
    }

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-invalid-transform-value',
          'Transform scale value must be a finite number.',
          {
            ...metadata,
            transformProperty: property
          }
        )
      );
    }
  }
}

function validateAngleProperties(
  transform: Record<string, unknown>,
  diagnostics: MotionDiagnostic[],
  metadata: TransformValidationMetadata
): void {
  for (const property of ANGLE_PROPERTIES) {
    const value = transform[property];

    if (value === undefined) {
      continue;
    }

    if (!isValidAngleValue(value)) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-invalid-transform-value',
          'Transform angle value must be a finite number or a non-empty string.',
          {
            ...metadata,
            transformProperty: property
          }
        )
      );
    }
  }
}

function validateOrigin(
  origin: unknown,
  diagnostics: MotionDiagnostic[],
  metadata: TransformValidationMetadata
): void {
  if (origin === undefined) {
    return;
  }

  if (typeof origin !== 'string' || origin.trim().length === 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-transform-origin',
        'Transform origin must be a non-empty string.',
        metadata
      )
    );
  }
}

function isValidLengthValue(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return typeof value === 'string' && value.trim().length > 0;
}

function isValidAngleValue(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return typeof value === 'string' && value.trim().length > 0;
}
