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

export type MotionSkipReason =
  | typeof MotionPlaybackResultReasons.MotionDisabled
  | typeof MotionPlaybackResultReasons.UnknownMotionType
  | typeof MotionPlaybackResultReasons.DriverCancelNotSupported
  | typeof MotionPlaybackResultReasons.DriverFinishNotSupported
  | typeof MotionPlaybackResultReasons.DriverResetNotSupported;

export type MotionEngineEventBase<TTarget = unknown> = {
  readonly source: MotionEngineEventSource;
  readonly target?: TTarget;
  readonly motionId?: string;
  readonly motionType?: string;
  readonly timestamp: number;
};

export type MotionBeforePlanEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: typeof MotionEngineEventTypes.BeforePlan;
  readonly config?: MotionConfig;
  readonly timeline?: MotionTimelineDefinition;
};

export type MotionPlanEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: typeof MotionEngineEventTypes.Plan;
  readonly plan: MotionExecutionPlan;
};

export type MotionPlayEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: typeof MotionEngineEventTypes.Play;
  readonly target: TTarget;
  readonly plan: MotionExecutionPlan;
};

export type MotionFinishEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: typeof MotionEngineEventTypes.Finish;
  readonly target: TTarget;
  readonly result: MotionPlaybackResult;
};

export type MotionCancelEvent<TTarget = unknown> = {
  readonly type: typeof MotionEngineEventTypes.Cancel;
  readonly target: TTarget;
  readonly result: MotionPlaybackResult;
  readonly timestamp: number;
};

export type MotionErrorEvent<TTarget = unknown> = MotionEngineEventBase<TTarget> & {
  readonly type: typeof MotionEngineEventTypes.Error;
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
  readonly type: typeof MotionEngineEventTypes.Skip;
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

export { MotionEngineEventSources, MotionEngineEventTypes };
