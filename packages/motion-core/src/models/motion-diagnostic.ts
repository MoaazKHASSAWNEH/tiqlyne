export type MotionDiagnosticLevel = 'info' | 'warning' | 'error';

export type MotionDiagnosticMetadata = Readonly<Record<string, string | number | boolean | null>>;

export type MotionDiagnostic = {
  readonly level: MotionDiagnosticLevel;
  readonly code: string;
  readonly message: string;
  readonly source?: string;
  readonly metadata?: MotionDiagnosticMetadata;
};
