import type { MotionPlaybackControllerStatus } from '../models/motion-playback-controller';
import type { MotionDiagnostic, MotionDiagnosticMetadata } from '../models/motion-diagnostic';
import {
  createMotionErrorDiagnostic,
  createMotionWarningDiagnostic
} from './create-motion-diagnostic';
import type { MotionDiagnosticSource } from './motion-diagnostic-source';

export function createPlaybackInvalidTransitionDiagnostic(
  action: string,
  currentStatus: MotionPlaybackControllerStatus,
  source: MotionDiagnosticSource | string
): MotionDiagnostic {
  return createMotionWarningDiagnostic(
    'playback-invalid-transition',
    `Cannot run "${action}" while playback is "${currentStatus}".`,
    source,
    {
      action,
      currentStatus
    }
  );
}

export function createPlaybackUnsupportedDiagnostic(
  code: string,
  message: string,
  source: MotionDiagnosticSource | string,
  metadata?: MotionDiagnosticMetadata
): MotionDiagnostic {
  return createMotionWarningDiagnostic(code, message, source, metadata);
}

export function createPlaybackInvalidInputDiagnostic(
  code: string,
  message: string,
  source: MotionDiagnosticSource | string,
  metadata?: MotionDiagnosticMetadata
): MotionDiagnostic {
  return createMotionWarningDiagnostic(code, message, source, metadata);
}

export function createPlaybackOperationFailedDiagnostic(
  code: string,
  message: string,
  source: MotionDiagnosticSource | string,
  metadata?: MotionDiagnosticMetadata
): MotionDiagnostic {
  return createMotionErrorDiagnostic(code, message, source, metadata);
}
