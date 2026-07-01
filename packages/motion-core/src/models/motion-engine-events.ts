import type { MotionConfig } from './motion-config';
import type { MotionExecutionPlan } from './motion-execution-plan';
import {
  MotionEngineEventSources,
  MotionEngineEventTypes,
  type MotionEngineEventSource
} from './motion-engine-event-type';
import type { MotionPlaybackResult } from './motion-playback-result';
import { MotionPlaybackResultReasons } from './motion-playback-result-reason';
import type { MotionTimelineDefinition } from './motion-timeline';

export type { MotionEngineEventSource } from './motion-engine-event-type';

/**
 * Built-in reasons accepted by engine skip events.
 *
 * Skip reasons are aligned with {@link MotionPlaybackResultReasons} so a skipped
 * event and its associated playback result can share the same reason value.
 */
export type MotionSkipReason =
  | typeof MotionPlaybackResultReasons.MotionDisabled
  | typeof MotionPlaybackResultReasons.UnknownMotionType
  | typeof MotionPlaybackResultReasons.DriverCancelNotSupported
  | typeof MotionPlaybackResultReasons.DriverFinishNotSupported
  | typeof MotionPlaybackResultReasons.DriverResetNotSupported;

/**
 * Shared fields available on most engine events.
 *
 * @typeParam TTarget - Target type used by the active engine driver.
 */
export type MotionEngineEventBase<TTarget = unknown> = {
  /**
   * Origin of the engine event.
   */
  readonly source: MotionEngineEventSource;

  /**
   * Runtime target associated with the event, when available.
   */
  readonly target?: TTarget;

  /**
   * Optional motion config identifier.
   */
  readonly motionId?: string;

  /**
   * Optional registered motion type.
   */
  readonly motionType?: string;

  /**
   * Timestamp in milliseconds.
   */
  readonly timestamp: number;
};

/**
 * Event emitted before the engine creates an execution plan.
 */
export type MotionBeforePlanEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: typeof MotionEngineEventTypes.BeforePlan;

  /**
   * Original motion config for registered motion planning.
   */
  readonly config?: MotionConfig;

  /**
   * Original direct timeline for timeline planning.
   */
  readonly timeline?: MotionTimelineDefinition;
};

/**
 * Event emitted after a valid execution plan has been created.
 */
export type MotionPlanEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: typeof MotionEngineEventTypes.Plan;

  /**
   * Execution plan created by the engine.
   */
  readonly plan: MotionExecutionPlan;
};

/**
 * Event emitted when the engine delegates playback to the driver.
 */
export type MotionPlayEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: typeof MotionEngineEventTypes.Play;

  /**
   * Runtime target passed to the driver.
   */
  readonly target: TTarget;

  /**
   * Execution plan used for playback.
   */
  readonly plan: MotionExecutionPlan;
};

/**
 * Event emitted when playback completes with a result.
 */
export type MotionFinishEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: typeof MotionEngineEventTypes.Finish;

  /**
   * Runtime target passed to the driver.
   */
  readonly target: TTarget;

  /**
   * Playback result returned by the driver or fallback logic.
   */
  readonly result: MotionPlaybackResult;
};

/**
 * Event emitted when playback cancellation is requested or completed.
 */
export type MotionCancelEvent<TTarget = unknown> = {
  readonly type: typeof MotionEngineEventTypes.Cancel;

  /**
   * Runtime target associated with the cancellation.
   */
  readonly target: TTarget;

  /**
   * Cancellation result.
   */
  readonly result: MotionPlaybackResult;

  /**
   * Timestamp in milliseconds.
   */
  readonly timestamp: number;
};

/**
 * Event emitted when the engine catches an error during planning or playback.
 */
export type MotionErrorEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: typeof MotionEngineEventTypes.Error;

  /**
   * Error value caught by the engine.
   */
  readonly error: unknown;
};

/**
 * Event callbacks accepted by the default engine.
 *
 * These callbacks are synchronous hooks intended for logging, debugging,
 * analytics or application-level observability.
 */
export type MotionEngineEvents<TTarget = unknown> = {
  readonly onBeforePlan?: (event: MotionBeforePlanEvent<TTarget>) => void;
  readonly onPlan?: (event: MotionPlanEvent<TTarget>) => void;
  readonly onPlay?: (event: MotionPlayEvent<TTarget>) => void;
  readonly onFinish?: (event: MotionFinishEvent<TTarget>) => void;
  readonly onCancel?: (event: MotionCancelEvent<TTarget>) => void;
  readonly onSkip?: (event: MotionSkipEvent<TTarget>) => void;
  readonly onError?: (event: MotionErrorEvent<TTarget>) => void;
};

/**
 * Event emitted when the engine skips an operation.
 */
export type MotionSkipEvent<TTarget = unknown> = {
  readonly type: typeof MotionEngineEventTypes.Skip;

  /**
   * Machine-readable reason explaining why the operation was skipped.
   */
  readonly reason: MotionSkipReason;

  /**
   * Playback result associated with the skip.
   */
  readonly result: MotionPlaybackResult;

  /**
   * Timestamp in milliseconds.
   */
  readonly timestamp: number;

  /**
   * Runtime target associated with the skip, when available.
   */
  readonly target?: TTarget;

  /**
   * Event source, when available.
   */
  readonly source?: MotionEngineEventSource;

  /**
   * Optional motion config identifier.
   */
  readonly motionId?: string;

  /**
   * Optional registered motion type.
   */
  readonly motionType?: string;
};

/**
 * Union of all engine events emitted by the core engine.
 */
export type MotionEngineEvent<TTarget = unknown> =
  | MotionBeforePlanEvent<TTarget>
  | MotionPlanEvent<TTarget>
  | MotionPlayEvent<TTarget>
  | MotionFinishEvent<TTarget>
  | MotionCancelEvent<TTarget>
  | MotionSkipEvent<TTarget>
  | MotionErrorEvent<TTarget>;

export { MotionEngineEventSources, MotionEngineEventTypes };
