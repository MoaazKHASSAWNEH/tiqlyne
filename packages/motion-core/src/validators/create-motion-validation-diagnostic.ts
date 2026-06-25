import type { MotionDiagnostic, MotionDiagnosticLevel } from '../models/motion-diagnostic';

export type MotionValidationMetadata = Record<string, string | number | boolean | null>;

export function createMotionValidationDiagnostic(
  code: string,
  message: string,
  metadata?: MotionValidationMetadata
): MotionDiagnostic {
  return {
    level: 'error',
    code,
    message,
    source: 'motion-timeline-validator',
    ...(metadata !== undefined ? { metadata } : {})
  };
}

export function createMotionValidationWarningDiagnostic(
  code: string,
  message: string,
  metadata?: MotionValidationMetadata
): MotionDiagnostic {
  return {
    level: 'warning',
    code,
    message,
    source: 'motion-timeline-validator',
    ...(metadata !== undefined ? { metadata } : {})
  };
}

export function createMotionValidationLevelDiagnostic(
  level: MotionDiagnosticLevel,
  code: string,
  message: string,
  metadata?: MotionValidationMetadata
): MotionDiagnostic {
  return {
    level,
    code,
    message,
    source: 'motion-timeline-validator',
    ...(metadata !== undefined ? { metadata } : {})
  };
}
