import {
  createMotionDiagnostic,
  createMotionErrorDiagnostic,
  createMotionWarningDiagnostic
} from '../diagnostics/create-motion-diagnostic';
import { MotionDiagnosticSources } from '../diagnostics/motion-diagnostic-source';
import type {
  MotionDiagnostic,
  MotionDiagnosticLevel,
  MotionDiagnosticMetadata
} from '../models/motion-diagnostic';

export type MotionValidationMetadata = MotionDiagnosticMetadata;

const VALIDATION_DIAGNOSTIC_SOURCE = MotionDiagnosticSources.TimelineValidator;

export function createMotionValidationDiagnostic(
  code: string,
  message: string,
  metadata?: MotionValidationMetadata
): MotionDiagnostic {
  return createMotionErrorDiagnostic(code, message, VALIDATION_DIAGNOSTIC_SOURCE, metadata);
}

export function createMotionValidationWarningDiagnostic(
  code: string,
  message: string,
  metadata?: MotionValidationMetadata
): MotionDiagnostic {
  return createMotionWarningDiagnostic(code, message, VALIDATION_DIAGNOSTIC_SOURCE, metadata);
}

export function createMotionValidationLevelDiagnostic(
  level: MotionDiagnosticLevel,
  code: string,
  message: string,
  metadata?: MotionValidationMetadata
): MotionDiagnostic {
  return createMotionDiagnostic({
    level,
    code,
    message,
    source: VALIDATION_DIAGNOSTIC_SOURCE,
    ...(metadata !== undefined
      ? {
          metadata
        }
      : {})
  });
}
