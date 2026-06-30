import type {
  MotionDiagnostic,
  MotionDiagnosticLevel,
  MotionDiagnosticMetadata
} from '../models/motion-diagnostic';
import type { MotionDiagnosticSource } from './motion-diagnostic-source';

export type CreateMotionDiagnosticInput = {
  readonly level: MotionDiagnosticLevel;
  readonly code: string;
  readonly message: string;
  readonly source?: MotionDiagnosticSource | string;
  readonly metadata?: MotionDiagnosticMetadata;
};

export function createMotionDiagnostic(input: CreateMotionDiagnosticInput): MotionDiagnostic {
  return {
    level: input.level,
    code: input.code,
    message: input.message,
    ...(input.source !== undefined
      ? {
          source: input.source
        }
      : {}),
    ...(input.metadata !== undefined
      ? {
          metadata: input.metadata
        }
      : {})
  };
}

export function createMotionWarningDiagnostic(
  code: string,
  message: string,
  source?: MotionDiagnosticSource | string,
  metadata?: MotionDiagnosticMetadata
): MotionDiagnostic {
  return createMotionDiagnostic({
    level: 'warning',
    code,
    message,
    ...(source !== undefined ? { source } : {}),
    ...(metadata !== undefined ? { metadata } : {})
  });
}

export function createMotionErrorDiagnostic(
  code: string,
  message: string,
  source?: MotionDiagnosticSource | string,
  metadata?: MotionDiagnosticMetadata
): MotionDiagnostic {
  return createMotionDiagnostic({
    level: 'error',
    code,
    message,
    ...(source !== undefined ? { source } : {}),
    ...(metadata !== undefined ? { metadata } : {})
  });
}

export function createMotionInfoDiagnostic(
  code: string,
  message: string,
  source?: MotionDiagnosticSource | string,
  metadata?: MotionDiagnosticMetadata
): MotionDiagnostic {
  return createMotionDiagnostic({
    level: 'info',
    code,
    message,
    ...(source !== undefined ? { source } : {}),
    ...(metadata !== undefined ? { metadata } : {})
  });
}
