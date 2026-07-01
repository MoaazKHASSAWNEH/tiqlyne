/**
 * Severity level of a motion diagnostic.
 *
 * Diagnostics are used to explain warnings, skipped operations and failures
 * without forcing every situation to throw an exception.
 */
export type MotionDiagnosticLevel = 'info' | 'warning' | 'error';

/**
 * Serializable metadata attached to a diagnostic.
 *
 * Metadata should stay lightweight and machine-readable so tooling can display,
 * filter or inspect diagnostics safely.
 */
export type MotionDiagnosticMetadata = Readonly<Record<string, string | number | boolean | null>>;

/**
 * Structured diagnostic emitted by validators, planners, drivers and controllers.
 *
 * A diagnostic describes what happened, where it happened and optionally includes
 * metadata that helps tools or developers understand the context.
 */
export type MotionDiagnostic = {
  /**
   * Diagnostic severity.
   */
  readonly level: MotionDiagnosticLevel;

  /**
   * Machine-readable diagnostic code.
   *
   * Built-in codes are exposed through {@link MotionDiagnosticCodes}.
   * Custom extensions may use their own string codes.
   */
  readonly code: string;

  /**
   * Human-readable explanation of the diagnostic.
   */
  readonly message: string;

  /**
   * Optional source that identifies which part of the engine produced the diagnostic.
   *
   * Built-in sources are exposed through {@link MotionDiagnosticSources}.
   */
  readonly source?: string;

  /**
   * Optional structured metadata for debugging or tooling.
   */
  readonly metadata?: MotionDiagnosticMetadata;
};
