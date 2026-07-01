/**
 * Stable event types emitted by playback controllers.
 *
 * Playback events describe low-level controller lifecycle changes and runtime
 * controls such as pause, resume, seek, progress updates, playback-rate changes
 * and direction changes.
 */
export const MotionPlaybackEventTypes = {
  /**
   * Emitted when a controller starts tracking a playback.
   */
  Start: 'start',

  /**
   * Emitted after any meaningful status change.
   */
  StatusChange: 'statusChange',

  /**
   * Emitted when playback pauses.
   */
  Pause: 'pause',

  /**
   * Emitted when playback resumes.
   */
  Resume: 'resume',

  /**
   * Emitted when playback is cancelled.
   */
  Cancel: 'cancel',

  /**
   * Emitted when playback finishes.
   */
  Finish: 'finish',

  /**
   * Emitted when an operation is skipped.
   */
  Skip: 'skip',

  /**
   * Emitted when playback or a controller operation fails.
   */
  Fail: 'fail',

  /**
   * Emitted when playback seeks to a new time or label.
   */
  Seek: 'seek',

  /**
   * Reserved for progress notifications.
   */
  Progress: 'progress',

  /**
   * Emitted when the playback rate changes.
   */
  PlaybackRateChange: 'playbackRateChange',

  /**
   * Emitted when playback direction changes.
   */
  DirectionChange: 'directionChange'
} as const;

/**
 * Built-in playback controller event type value.
 */
export type MotionPlaybackEventType =
  (typeof MotionPlaybackEventTypes)[keyof typeof MotionPlaybackEventTypes];
