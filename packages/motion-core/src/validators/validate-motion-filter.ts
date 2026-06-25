import { createMotionValidationDiagnostic as createErrorDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import { isRecord } from '../utils/is-record';

const NUMBER_FILTER_PROPERTIES = [
  'brightness',
  'contrast',
  'grayscale',
  'invert',
  'opacity',
  'saturate',
  'sepia'
] as const;

type FilterValidationMetadata = {
  readonly trackIndex: number;
  readonly stepIndex: number;
  readonly keyframeIndex: number;
};

export function validateMotionFilter(
  filter: unknown,
  diagnostics: MotionDiagnostic[],
  metadata: FilterValidationMetadata
): void {
  if (filter === undefined) {
    return;
  }

  if (typeof filter === 'string') {
    if (filter.trim().length === 0) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-invalid-filter',
          'Keyframe filter must be a non-empty string or a structured filter object.',
          metadata
        )
      );
    }

    return;
  }

  if (!isRecord(filter)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-filter',
        'Keyframe filter must be a non-empty string or a structured filter object.',
        metadata
      )
    );

    return;
  }

  validateLengthFilterValue(filter.blur, 'blur', diagnostics, metadata);
  validateAngleFilterValue(filter.hueRotate, 'hueRotate', diagnostics, metadata);
  validateNumberFilterValues(filter, diagnostics, metadata);
  validateDropShadow(filter.dropShadow, diagnostics, metadata);
}

function validateNumberFilterValues(
  filter: Record<string, unknown>,
  diagnostics: MotionDiagnostic[],
  metadata: FilterValidationMetadata
): void {
  for (const property of NUMBER_FILTER_PROPERTIES) {
    const value = filter[property];

    if (value === undefined) {
      continue;
    }

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      diagnostics.push(
        createErrorDiagnostic(
          'timeline-invalid-filter-value',
          'Filter numeric value must be a finite number.',
          {
            ...metadata,
            filterProperty: property
          }
        )
      );
    }
  }
}

function validateLengthFilterValue(
  value: unknown,
  property: string,
  diagnostics: MotionDiagnostic[],
  metadata: FilterValidationMetadata
): void {
  if (value === undefined) {
    return;
  }

  if (!isValidLengthOrAngleValue(value)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-filter-value',
        'Filter length value must be a finite number or a non-empty string.',
        {
          ...metadata,
          filterProperty: property
        }
      )
    );
  }
}

function validateAngleFilterValue(
  value: unknown,
  property: string,
  diagnostics: MotionDiagnostic[],
  metadata: FilterValidationMetadata
): void {
  if (value === undefined) {
    return;
  }

  if (!isValidLengthOrAngleValue(value)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-filter-value',
        'Filter angle value must be a finite number or a non-empty string.',
        {
          ...metadata,
          filterProperty: property
        }
      )
    );
  }
}

function validateDropShadow(
  dropShadow: unknown,
  diagnostics: MotionDiagnostic[],
  metadata: FilterValidationMetadata
): void {
  if (dropShadow === undefined) {
    return;
  }

  if (typeof dropShadow !== 'string' || dropShadow.trim().length === 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-filter-value',
        'Filter dropShadow value must be a non-empty string.',
        {
          ...metadata,
          filterProperty: 'dropShadow'
        }
      )
    );
  }
}

function isValidLengthOrAngleValue(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return typeof value === 'string' && value.trim().length > 0;
}
