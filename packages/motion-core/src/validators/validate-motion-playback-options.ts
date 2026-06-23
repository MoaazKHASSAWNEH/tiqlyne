import type { MotionValidationMetadata as ValidationMetadata } from './create-motion-validation-diagnostic';
import { createMotionValidationDiagnostic as createErrorDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionPlaybackDirection, MotionIterationCount } from '../models/motion-timeline';

export function validatePlaybackTimingOptions(
  options: {
    readonly iterations: MotionIterationCount | undefined;
    readonly direction: MotionPlaybackDirection | undefined;
    readonly endDelay: number | undefined;
    readonly playbackRate: number | undefined;
  },
  diagnostics: MotionDiagnostic[],
  metadata: ValidationMetadata
): void {
  validateIterations(options.iterations, diagnostics, metadata);
  validatePlaybackDirection(options.direction, diagnostics, metadata);
  validateEndDelay(options.endDelay, diagnostics, metadata);
  validatePlaybackRate(options.playbackRate, diagnostics, metadata);
}

function validateIterations(
  iterations: MotionIterationCount | undefined,
  diagnostics: MotionDiagnostic[],
  metadata: ValidationMetadata
): void {
  if (iterations === undefined) {
    return;
  }

  if (iterations === 'infinite') {
    return;
  }

  if (!Number.isFinite(iterations) || iterations <= 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-iterations',
        'Timeline iterations must be a finite positive number or "infinite".',
        {
          ...metadata,
          iterations
        }
      )
    );
  }
}

function validatePlaybackDirection(
  direction: MotionPlaybackDirection | undefined,
  diagnostics: MotionDiagnostic[],
  metadata: ValidationMetadata
): void {
  if (direction === undefined) {
    return;
  }

  if (!isMotionPlaybackDirection(direction)) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-direction',
        'Timeline direction must be normal, reverse, alternate or alternate-reverse.',
        {
          ...metadata,
          direction
        }
      )
    );
  }
}

function validateEndDelay(
  endDelay: number | undefined,
  diagnostics: MotionDiagnostic[],
  metadata: ValidationMetadata
): void {
  if (endDelay === undefined) {
    return;
  }

  if (!Number.isFinite(endDelay) || endDelay < 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-end-delay',
        'Timeline endDelay must be a finite non-negative number.',
        {
          ...metadata,
          endDelay
        }
      )
    );
  }
}

function validatePlaybackRate(
  playbackRate: number | undefined,
  diagnostics: MotionDiagnostic[],
  metadata: ValidationMetadata
): void {
  if (playbackRate === undefined) {
    return;
  }

  if (!Number.isFinite(playbackRate) || playbackRate <= 0) {
    diagnostics.push(
      createErrorDiagnostic(
        'timeline-invalid-playback-rate',
        'Timeline playbackRate must be a finite positive number.',
        {
          ...metadata,
          playbackRate
        }
      )
    );
  }
}

function isMotionPlaybackDirection(direction: MotionPlaybackDirection): boolean {
  return (
    direction === 'normal' ||
    direction === 'reverse' ||
    direction === 'alternate' ||
    direction === 'alternate-reverse'
  );
}
