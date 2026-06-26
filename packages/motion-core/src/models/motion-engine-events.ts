import type { MotionConfig } from './motion-config';
import type { MotionExecutionPlan } from './motion-execution-plan';
import type { MotionPlaybackResult } from './motion-playback-result';
import type { MotionTimelineDefinition } from './motion-timeline';

export type MotionEngineEventSource = 'registered-motion' | 'direct-timeline';

export type MotionSkipReason =
  | 'motion-disabled'
  | 'unknown-motion-type'
  | 'driver-cancel-not-supported'
  | 'driver-finish-not-supported'
  | 'driver-reset-not-supported';

export type MotionEngineEventBase<TTarget = unknown> = {
  readonly source: MotionEngineEventSource;
  readonly target?: TTarget;
  readonly motionId?: string;
  readonly motionType?: string;
  readonly timestamp: number;
};

export type MotionBeforePlanEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: 'before-plan';
  readonly config?: MotionConfig;
  readonly timeline?: MotionTimelineDefinition;
};

export type MotionPlanEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: 'plan';
  readonly plan: MotionExecutionPlan;
};

export type MotionPlayEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: 'play';
  readonly target: TTarget;
  readonly plan: MotionExecutionPlan;
};

export type MotionFinishEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: 'finish';
  readonly target: TTarget;
  readonly result: MotionPlaybackResult;
};

export type MotionCancelEvent<TTarget = unknown> = {
  readonly type: 'cancel';
  readonly target: TTarget;
  readonly result: MotionPlaybackResult;
  readonly timestamp: number;
};

export type MotionErrorEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: 'error';
  readonly error: unknown;
};

export type MotionEngineEvents<TTarget = unknown> = {
  readonly onBeforePlan?: (event: MotionBeforePlanEvent<TTarget>) => void;
  readonly onPlan?: (event: MotionPlanEvent<TTarget>) => void;
  readonly onPlay?: (event: MotionPlayEvent<TTarget>) => void;
  readonly onFinish?: (event: MotionFinishEvent<TTarget>) => void;
  readonly onCancel?: (event: MotionCancelEvent<TTarget>) => void;
  readonly onSkip?: (event: MotionSkipEvent<TTarget>) => void;
  readonly onError?: (event: MotionErrorEvent<TTarget>) => void;
};

export type MotionSkipEvent<TTarget = unknown> = {
  readonly type: 'skip';
  readonly reason: MotionSkipReason;
  readonly result: MotionPlaybackResult;
  readonly timestamp: number;
  readonly target?: TTarget;
  readonly source?: MotionEngineEventSource;
  readonly motionId?: string;
  readonly motionType?: string;
};

export type MotionEngineEvent<TTarget = unknown> =
  | MotionBeforePlanEvent<TTarget>
  | MotionPlanEvent<TTarget>
  | MotionPlayEvent<TTarget>
  | MotionFinishEvent<TTarget>
  | MotionCancelEvent<TTarget>
  | MotionSkipEvent<TTarget>
  | MotionErrorEvent<TTarget>;
