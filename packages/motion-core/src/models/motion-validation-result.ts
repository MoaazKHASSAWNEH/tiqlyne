import type { MotionDiagnostic } from './motion-diagnostic';

export type MotionValidationResult = {
  readonly valid: boolean;
  readonly diagnostics: ReadonlyArray<MotionDiagnostic>;
};
