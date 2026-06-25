import type { MotionDiagnosticLevel } from './motion-diagnostic';

export type MotionPerformanceDiagnosticLevel = MotionDiagnosticLevel | 'off';

export type MotionPerformanceDiagnosticsOptions = {
  readonly filter?: MotionPerformanceDiagnosticLevel;
  readonly shadow?: MotionPerformanceDiagnosticLevel;
  readonly paint?: MotionPerformanceDiagnosticLevel;
};

export type MotionValidationOptions = {
  readonly performanceDiagnostics?: MotionPerformanceDiagnosticsOptions;
};
