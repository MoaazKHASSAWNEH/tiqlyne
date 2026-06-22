import type { MotionDiagnostic } from '../models/motion-diagnostic';

export class MotionPlanningError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly diagnostics: ReadonlyArray<MotionDiagnostic> = [],
    public readonly validationErrors: ReadonlyArray<string> = []
  ) {
    super(message);

    this.name = 'MotionPlanningError';

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
