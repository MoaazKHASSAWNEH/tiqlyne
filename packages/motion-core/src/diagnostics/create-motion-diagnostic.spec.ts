import { describe, expect, it } from 'vitest';
import {
  createMotionDiagnostic,
  createMotionErrorDiagnostic,
  createMotionInfoDiagnostic,
  createMotionWarningDiagnostic
} from './create-motion-diagnostic';

describe('createMotionDiagnostic', () => {
  it('creates a diagnostic without optional fields', () => {
    expect(
      createMotionDiagnostic({
        level: 'warning',
        code: 'test-warning',
        message: 'Test warning.'
      })
    ).toEqual({
      level: 'warning',
      code: 'test-warning',
      message: 'Test warning.'
    });
  });

  it('creates a diagnostic with source and metadata', () => {
    expect(
      createMotionDiagnostic({
        level: 'error',
        code: 'test-error',
        message: 'Test error.',
        source: 'test-source',
        metadata: {
          value: 1
        }
      })
    ).toEqual({
      level: 'error',
      code: 'test-error',
      message: 'Test error.',
      source: 'test-source',
      metadata: {
        value: 1
      }
    });
  });

  it('creates warning, error and info diagnostics', () => {
    expect(createMotionWarningDiagnostic('warning-code', 'Warning.')).toMatchObject({
      level: 'warning',
      code: 'warning-code'
    });

    expect(createMotionErrorDiagnostic('error-code', 'Error.')).toMatchObject({
      level: 'error',
      code: 'error-code'
    });

    expect(createMotionInfoDiagnostic('info-code', 'Info.')).toMatchObject({
      level: 'info',
      code: 'info-code'
    });
  });
});
