/**
 * Stable event types emitted by the motion engine lifecycle.
 *
 * Engine events describe high-level operations such as planning, playing,
 * finishing, skipping or failing. They are intended for logging, analytics,
 * debugging tools and application-level hooks.
 */
export const MotionEngineEventTypes = {
  /**
   * Emitted before the engine creates an execution plan.
   */
  BeforePlan: 'before-plan',

  /**
   * Emitted after the engine creates an execution plan.
   */
  Plan: 'plan',

  /**
   * Emitted when playback starts through the driver.
   */
  Play: 'play',

  /**
   * Emitted when playback finishes and returns a result.
   */
  Finish: 'finish',

  /**
   * Emitted when playback is cancelled.
   */
  Cancel: 'cancel',

  /**
   * Emitted when playback is skipped.
   */
  Skip: 'skip',

  /**
   * Emitted when planning or playback fails unexpectedly.
   */
  Error: 'error'
} as const;

/**
 * Built-in motion engine event type value.
 */
export type MotionEngineEventType =
  (typeof MotionEngineEventTypes)[keyof typeof MotionEngineEventTypes];

/**
 * Stable sources used by engine events.
 *
 * A source indicates whether an event comes from a registered motion definition
 * or from a direct timeline call.
 */
export const MotionEngineEventSources = {
  /**
   * Event produced from a registered motion config.
   */
  RegisteredMotion: 'registered-motion',

  /**
   * Event produced from a direct timeline or composition playback.
   */
  DirectTimeline: 'direct-timeline'
} as const;

/**
 * Built-in motion engine event source value.
 */
export type MotionEngineEventSource =
  (typeof MotionEngineEventSources)[keyof typeof MotionEngineEventSources];
