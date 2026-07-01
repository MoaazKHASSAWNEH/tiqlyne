import type { MotionDiagnostic } from './motion-diagnostic';
import type { MotionPlaybackResultReason } from './motion-playback-result-reason';

/**
 * Status returned by a playback operation.
 *
 * A playback result represents the outcome of one operation, not necessarily
 * the complete lifecycle of a controller.
 */
export type MotionPlaybackStatus =
  | 'finished'
  | 'cancelled'
  | 'skipped'
  | 'failed'
  | 'paused'
  | 'running';

/**
 * Standard result returned by engine, driver and controller playback operations.
 *
 * Results are intentionally serializable-friendly except for the optional
 * `error` field, which may contain a native runtime error.
 */
export type MotionPlaybackResult = {
  /**
   * Operation outcome.
   */
  readonly status: MotionPlaybackStatus;

  /**
   * Machine-readable reason explaining why this result happened.
   *
   * Built-in reasons are exposed through {@link MotionPlaybackResultReasons}.
   * Custom drivers and plugins may also return custom strings.
   */
  readonly reason?: MotionPlaybackResultReason | string;

  /**
   * Optional runtime error associated with a failed operation.
   */
  readonly error?: unknown;

  /**
   * Optional diagnostics that explain warnings, skipped operations or failures.
   */
  readonly diagnostics?: ReadonlyArray<MotionDiagnostic>;
};
